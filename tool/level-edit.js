$(function() {
    var baseUrl = document.location.href.split('/').slice(0, -1).join('/');

    function assetApplyDraggable(elements)
    {
        elements.addClass('asset').draggable({
            start: function() { grid.droppable("enable"); },
            stop: function() { grid.droppable("disable"); },
            revert: true,
            revertDuration: 0,
            helper:'clone',
            appendTo: 'body',
        });
    }

    function createAsset(type)
    {
        return $('<div class="asset" type="' + (type || 'misc') + '"></div>');
    }

    function getZoomLevel()
    {
        return parseFloat(zoom.css('zoom')) || 1;
    }

    function zoomWorkspace(ratio)
    {
        var level = getZoomLevel();
        level *= ratio

        if (level < .25) {
            return false;
        }

        var sizeShift = {
            x: Math.round(workspace.scrollLeft() * ratio),
            y: Math.round(workspace.scrollTop() * ratio),
        };

        zoom.css({
            'zoom': level,
        });

        var viewPort = {
            x: Math.round(workspace.width() / 2),
            y: Math.round(workspace.height() / 2),
        };

        if (ratio > 1) {
            workspace.scrollLeft(sizeShift.x + viewPort.x);
            workspace.scrollTop(sizeShift.y + viewPort.y);
        }
        else {
            workspace.scrollLeft(sizeShift.x - viewPort.x * ratio);
            workspace.scrollTop(sizeShift.y - viewPort.y * ratio);
        }

        console.log(scrollShift);



        return level;
    }

    function loadXML(xmlUrl)
    {
        var urlBase = xmlUrl.split('/').slice(0, -1).join('/');
        $.ajax({
            url: xmlUrl,
            dataType: "xml",
            success: function(response) {
                var level = $(response);
                level.find('level > sprites').each(function(i, sprites) {
                    sprites = $(sprites);
                    var spriteImageUrl = urlBase + '/' + sprites.attr('url');

                    var spriteIndex = {};
                    sprites.children('sprite').each(function(i, sprite) {
                        sprite = $(sprite);
                        spriteIndex[sprite.attr('id')] = {
                            x: parseFloat(sprite.attr('x')),
                            y: parseFloat(sprite.attr('y')),
                            w: parseFloat(sprite.attr('w')),
                            h: parseFloat(sprite.attr('h')),
                        };
                    });
                    var animationSpriteIndex = {};
                    sprites.children('animation').each(function(i, anim) {
                        anim = $(anim);
                        var frame = anim.find('frame');
                        animationSpriteIndex[anim.attr('name')] = spriteIndex[frame.attr('sprite')];
                    });

                    sprites.find('objects > object').each(function(i, object) {
                        object = $(object);

                        var w = parseFloat(object.attr('w'));
                        var h = parseFloat(object.attr('h'));
                        var wSegs = parseFloat(object.attr('segments-w')) || 1;
                        var hSegs = parseFloat(object.attr('segments-h')) || 1;

                        var objectElement = $('<div class="object" type="object"></object>').css({
                            'background-image': "url('" + spriteImageUrl + "')",
                            'width': object.attr('w') + 'px',
                            'height': object.attr('h') + 'px',
                        }).attr('title', object.attr('id')).attr('ref', object.attr('id'));

                        object.children().each(function(i, face) {
                            face = $(face);
                            if (face.is('animation')) {
                                var sprite = animationSpriteIndex[face.attr('ref')];
                            }
                            var tile = $('<div/>').css({
                                'background-image': 'inherit',
                                'background-position': '-' + sprite.x + 'px -' + sprite.y + 'px',
                                'float': 'left',
                                'width': sprite.w,
                                'height': sprite.h
                            });
                            objectElement.append(tile);
                        });

                        assetApplyDraggable(objectElement);
                        $('.assets .sprites').append(objectElement);
                    });
                });

                level.find('level > layout').each(function(i, layout) {
                    $(this).find('solids > rect').each(function(i, solid) {
                        solid = $(solid);
                        var asset = createAsset('solid');
                        asset
                            .addClass('solid rect')
                            .css({
                                'left': solid.attr('x') + 'px',
                                'top': solid.attr('y') + 'px',
                                'width': solid.attr('w') + 'px',
                                'height': solid.attr('h') + 'px',
                            });
                        workspace.items.addItem(asset);
                    });
                });
            },
        });
    }

    function updateTemplate(url)
    {
        var img = new Image();
        img.onload = function() {
            var w = this.width;
            var h = this.height;
            zoom.css({
                'height': (h * 3) + 'px',
                'width': (w * 3) + 'px',
            });
            grid.css({
                'top': h + 'px',
                'left': w + 'px',
                'height': h + 'px',
                'width': w + 'px',
            })
            .children('.template').css({
                'background-image': "url('" + this.src + "')",
            });
            workspace.scrollLeft(w);
            workspace.scrollTop(h);
        }
        img.src = url;
    }

    var objectMani = new ObjectManipulator();
    levelEdit.objectManipulator = objectMani;
    levelEdit.objectManipulator.quantizer = 16;


    var workspace = $('.workspace');
    levelEdit.workspace = workspace;
    var grid = workspace.find('.grid');
    workspace.grid = grid;
    var zoom = workspace.find('.zoom');
    var controlpanel = $('.controlpanel');
    var assets = $('.assets');
    workspace.items = workspace.find('.items');
    workspace.items.addItem = function(item)
    {
        item.css({
            position: 'absolute',
        })
        .draggable({
            containment: '.zoom',
            stop: function(event, ui) {
                levelEdit.objectManipulator.move(ui.position.left, ui.position.top);
            },
        });
        var type = item.attr('type') || 'misc';
        this.children('.layer.' + type).append(item);
        workspace.layer.toggle(type, true);
    }
    workspace.layer = {
        toggle: function(name, state)
        {
            switch (name) {
                case 'template':
                    workspace.grid.children('.template').toggle(state);
                    break;
                case 'grid':
                    workspace.grid.children('.overlay').toggle(state);
                    break;
                default:
                    workspace.items.children('.layer.' + name).toggle(state);
                    break;
            }
            //debugger;
            workspace.layer.switches.filter('[name="' + name + '"]').prop('checked', state);
        },
        switches: controlpanel.find('.layers > :input'),
    }

    grid.droppable({
        accept: '.asset',
        tolerance: "fit",
        drop: function(event, ui) {
            var sprite = ui.draggable.clone();
            workspace.items.addItem(sprite);

            var zoomFactor = getZoomLevel();
            var dropPos = {
                x: ui.position.left / zoomFactor,
                y: ui.position.top / zoomFactor,
            };
            dropPos.x -= grid.offset().left;
            dropPos.y -= grid.offset().top;
            levelEdit.objectManipulator.select(sprite);
            levelEdit.objectManipulator.move(dropPos.x, dropPos.y);
        }
    }).droppable("disable");

    grid.children('.items').on('mousedown', '.asset', function(e) {
        levelEdit.objectManipulator.select($(this));
    });

    controlpanel.find('.zoom > button').on('click', function() {
        zoomWorkspace(parseFloat($(this).data('mag')));
    });
    controlpanel.find('.snap > :input').on('change', function() {
        levelEdit.objectManipulator.quantizer = parseFloat(this.value) || 1;
    });
    workspace.layer.switches.on('change', function() {
        var name = $(this).attr('name');
        var state = $(this).prop('checked');
        workspace.layer.toggle(name, state);
    });

    workspace.on('mousewheel', function(e) {
        e.preventDefault();
        e.stopPropagation();
        var factor = e.originalEvent.deltaY < 0 ? 2 : .5;
        zoomWorkspace(factor);
    });

    assets.on('mousewheel', function(e) {
        e.stopPropagation();
    });

    var zoomAreaDraggable = Draggable.create(workspace, {type:"scroll", edgeResistance:1})[0];
    zoomAreaDraggable.disable();

    assets.draggable();

    var solids = assets.find('.solid');
    assetApplyDraggable(assets.find('.solid'));

    $('#xml').submit(function(e) {
        e.preventDefault();
        var xmlUrl = $('input[name=xml]').val();
        if (xmlUrl)
            loadXML(xmlUrl);
    });

    $('#template').submit(function(e) {
        e.preventDefault();
        var template = $('input[name=template]').val();

        if (template)
            updateTemplate(template);
    });

    var keyboard = new KeyboardHelper();
    keyboard.intermittent(71,
        function() {
            zoomAreaDraggable.enable();
        },
        function() {
            zoomAreaDraggable.disable();
        });
    keyboard.hit(65, function() {
        assets.toggle();
    });
    // Up
    keyboard.hit(38, function(event) {
        switch (objectMani.mode) {
            case 'size':
                objectMani.nudgeSize(0, -16);
                break;
            default:
                objectMani.nudge(0, -16);
                break;
        }
    });
    // Down
    keyboard.hit(40, function() {
        switch (objectMani.mode) {
            case 'size':
                objectMani.nudgeSize(0, 16);
                break;
            default:
                objectMani.nudge(0, 16);
                break;
        }
    });
    // Left
    keyboard.hit(37, function() {
        switch (objectMani.mode) {
            case 'size':
                objectMani.nudgeSize(-16, 0);
                break;
            default:
                objectMani.nudge(-16, 0);
                break;
        }
    });
    // Right
    keyboard.hit(39, function() {
        switch (objectMani.mode) {
            case 'size':
                objectMani.nudgeSize(16, 0);
                break;
            default:
                objectMani.nudge(16, 0);
                break;
        }
    });
    keyboard.hit(46, function() {
        objectMani.remove();
    });
    keyboard.hit(77, function() {
        objectMani.mode = 'move';
    });
    keyboard.hit(83, function() {
        objectMani.mode = 'size';
    })


    $(':input').on('focus', function() {
        keyboard.enabled = false;
    }).on('blur', function() {
        keyboard.enabled = true;
    });

    $('button#generateXml').on('click', function() {
        var items = workspace.items;
        var level = $('<level></level>');

        var objects = $('<objects></objects>');
        items.find('.layer.object > .object').each(function(i, item) {
            item = $(item);
            var object = $('<object/>');
            object.attr('ref', item.attr('ref'));
            object.attr('x', parseFloat(item.css('left')));
            object.attr('y', parseFloat(item.css('top')));
            objects.append(object);
        });
        level.append(objects);

        var solids = $('<solids></solids>');
        items.find('.layer.solid > .solid').each(function(i, item) {
            item = $(item);
            var rect = $('<rect/>');
            rect.attr('x', parseFloat(item.css('left')));
            rect.attr('y', parseFloat(item.css('top')));
            rect.attr('w', parseFloat(item.css('width')));
            rect.attr('h', parseFloat(item.css('height')));
            solids.append(rect);
        });
        level.append(solids);

        $('#console').val(level[0].outerHTML);
    });



    $('input[name=template').val(baseUrl + '/templates/flashman.png');
    $('#template').submit();
    $('input[name=xml').val(baseUrl + '/../src/levels/flashman/Flashman.xml');
    $('#xml').submit();

});
var levelEdit = {};

KeyboardHelper = function()
{
    this.enabled = true;
    this.bindings = {
        'down': {},
        'up': {}
    };
    this.keystate = {};

    window.addEventListener('keydown', this.keyDownEvent.bind(this));
    window.addEventListener('keyup', this.keyUpEvent.bind(this));
}

KeyboardHelper.prototype.hit = function(code, callback)
{
    this.bindings.down[code] = callback;
}

KeyboardHelper.prototype.intermittent = function(code, downCallback, upCallback)
{
    this.bindings.down[code] = downCallback;
    this.bindings.up[code] = upCallback;
}

KeyboardHelper.prototype.keyDownEvent = function(event)
{
    if (!this.enabled) {
        return;
    }

    var k = event.keyCode;
    if (this.keystate[k]) {
        event.preventDefault();
        return;
    }
    console.log('Key Down: %d', k);
    this.keystate[k] = new Date();
    if (this.bindings.down[k]) {
        event.preventDefault();
        this.bindings.down[k](event);
    }
}

KeyboardHelper.prototype.keyUpEvent = function(event)
{
    if (!this.enabled) {
        return;
    }

    var k = event.keyCode;
    var start = this.keystate[k];
    var stop = new Date();
    var duration = (stop.getTime() - start.getTime()) / 1000;;
    console.log('Key Up: %d, %f', k, duration);
    delete this.keystate[k];
    if (this.bindings.up[k]) {
        event.preventDefault();
        this.bindings.up[k](event, duration);
    }
}

var ObjectManipulator = function()
{
    this.quantizer = 1;
    this.multiplier = 1;
    this.selectedObject = undefined;

    this.undo = [];
}

ObjectManipulator.prototype.nudge = function(x, y)
{
    var pos = this.pos();
    this.move(pos.x + x, pos.y + y);
}

ObjectManipulator.prototype.nudgeSize = function(w, h)
{
    var size = this.size();
    this.resize(size.w + w, size.h + h);
}

ObjectManipulator.prototype.move = function(x, y)
{
    x = this.quantize(x);
    y = this.quantize(y);
    this.selectedObject.style.left = x + 'px';
    this.selectedObject.style.top = y + 'px';
}

ObjectManipulator.prototype.pos = function()
{
    return {
        x: parseFloat(this.selectedObject.style.left) || 0,
        y: parseFloat(this.selectedObject.style.top) || 0,
    };
}

ObjectManipulator.prototype.quantize = function(value)
{
    var rest = (value % this.quantizer);
    value -= rest;
    if (rest > this.quantizer / 2) {
        value += this.quantizer;
    }
    return value;
}

ObjectManipulator.prototype.remove = function()
{
    this.undo.push(this.selectedObject);
    this.selectedObject.parentNode.removeChild(this.selectedObject);
}

ObjectManipulator.prototype.resize = function(w, h)
{
    w = this.quantize(w);
    h = this.quantize(h);
    this.selectedObject.style.width = w + 'px';
    this.selectedObject.style.height = h + 'px';
}

ObjectManipulator.prototype.select = function(object)
{
    $(this.selectedObject).removeClass('selected');
    this.selectedObject = object.addClass('selected').get(0);
}

ObjectManipulator.prototype.size = function()
{
    return {
        w: parseFloat(this.selectedObject.style.width),
        h: parseFloat(this.selectedObject.style.height),
    };
}
