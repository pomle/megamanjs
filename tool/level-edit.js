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

    function createAsset()
    {
        return $('<div class="asset"></div>');
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

        zoom.css({
            'zoom': level,
        });

        var centerShift = {
            x: Math.round((workspace.width() * 1) / 2),
            y: Math.round((workspace.height() * 1) / 2),
        };

        var scrollShift = {
            x: Math.round(workspace.scrollLeft() * ratio),
            y: Math.round(workspace.scrollTop() * ratio),
        };

        if (ratio < 1) {
            centerShift.x = -centerShift.x * ratio;
            centerShift.y = -centerShift.y * ratio;
        }
        //console.log(scrollShift, centerShift);
        workspace.scrollLeft(scrollShift.x + centerShift.x);
        workspace.scrollTop(scrollShift.y + centerShift.y);
        return level;
    }

    function loadXML(xmlUrl)
    {
        var urlBase = xmlUrl.split('/').slice(0, -1).join('/');
        $.ajax({
            url: xmlUrl,
            success: function(response) {
                var level = $(response);
                level.children('level > sprites').each(function(i, sprites) {
                    sprites = $(sprites);
                    var spriteImageUrl = urlBase + '/' + sprites.attr('url');
                    sprites.children('sprite').each(function(i, sprite) {
                        sprite = $(sprite);
                        var bounds = sprite.children('bounds');

                        var spriteElement = $('<div class="sprite"></div>');

                        spriteElement
                            .addClass(sprite.attr('id'))
                            .css({
                                background: "url('" + spriteImageUrl + "') -" + bounds.attr('x') + 'px -' + bounds.attr('y') + 'px',
                                height: bounds.attr('h') + 'px',
                                width: bounds.attr('w') + 'px',
                            });

                        assetApplyDraggable(spriteElement);
                        $('.assets .sprites').append(spriteElement);

                    });
                });

                level.children('layout').each(function(i, layout) {
                    console.log($(this).find('solids>solid'));
                    $(this).find('solids > rect').each(function(i, solid) {
                        solid = $(solid);
                        var asset = createAsset();
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
        this.append(item);
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
            /*dropPos.x -= workspace.offset().left;
            dropPos.y -= workspace.offset().top;
            dropPos.x -= workspace.scrollLeft();
            dropPos.x += grid.offset().left;*/
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
    console.dir(zoomAreaDraggable);
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
        $('#console').html('');
        var level = $('<level></level>');
        var items = workspace.find('.items');
        items.each(function(i, item) {
            item = $(item);

            var solids = $('<solids></solids>');
            item.find('.solid').each(function(i, item) {
                item = $(item);
                var rect = $('<rect/>');
                rect.attr('x', parseFloat(item.css('left')));
                rect.attr('y', parseFloat(item.css('top')));
                rect.attr('w', parseFloat(item.css('width')));
                rect.attr('h', parseFloat(item.css('height')));
                solids.append(rect);
            });
            level.append(solids);
        });

        //console.log(level, level[0], level[0].outerHTML);
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
    object.addClass('selected').siblings().removeClass('selected');
    this.selectedObject = object.get(0);
}

ObjectManipulator.prototype.size = function()
{
    return {
        w: parseFloat(this.selectedObject.style.width),
        h: parseFloat(this.selectedObject.style.height),
    };
}
