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

    function clearAssets()
    {
        assets.find('> div').each(function() {
            var panel = $(this);
            if (!panel.hasClass('collision')) {
                panel.html('');
            }
        });
    }

    function expandRange(input, total)
    {
        var values = [];
        var groups, group, ranges, range, mod, upper, lower, i;

        groups = input.split(',');

        while (group = groups.shift()) {

            mod = parseFloat(group.split('/')[1]) || 1;
            ranges = group.split('-');

            if (ranges.length == 2) {
                lower = parseFloat(ranges[0]);
                upper = parseFloat(ranges[1]);
            }
            else if (ranges[0] == '*') {
                lower = 1;
                upper = total;
            }
            else {
                lower = parseFloat(ranges[0]);
                upper = lower;
            }

            i = 0;
            while (lower <= upper) {
                if (i++ % mod === 0) {
                    values.push(lower);
                }
                lower++
            }
        }

        return values;
    }

    function loadXML(xmlUrl)
    {
        var urlBase = xmlUrl.split('/').slice(0, -1).join('/');
        clearAssets();
        $.ajax({
            url: xmlUrl,
            dataType: "xml",
            error: function() {
                alert("Could not load " + xmlUrl);
            },
            success: function(response) {
                var level = $(response);

                var spriteIndex = {};
                var objectIndex = {};

                levelEdit.backgroundManager = new BackgroundManager();
                levelEdit.tileManager = new TileManager();


                level.find('level > sprites').each(function(i, sprites) {
                    sprites = $(sprites);
                    var spriteImageUrl = urlBase + '/' + sprites.attr('url');

                    sprites.children('sprite').each(function(i, spriteXml) {
                        spriteXml = $(spriteXml)
                        var tile = levelEdit.tileManager.createTile(spriteImageUrl, spriteXml.attr('id'),
                            parseFloat(spriteXml.attr('x')), parseFloat(spriteXml.attr('y')), parseFloat(spriteXml.attr('w')), parseFloat(spriteXml.attr('h')));
                    });
                    var animationSpriteIndex = {};
                    sprites.children('animation').each(function(i, anim) {
                        anim = $(anim);
                        var frame = anim.find('frame');
                        animationSpriteIndex[anim.attr('name')] = spriteIndex[frame.attr('sprite')];
                    });

                    sprites.find('objects > object').each(function(i, object) {
                        object = $(object);
                        var objectId = object.attr('id');

                        var w = parseFloat(object.attr('w'));
                        var h = parseFloat(object.attr('h'));
                        var wSegs = parseFloat(object.attr('segments-w')) || 1;
                        var hSegs = parseFloat(object.attr('segments-h')) || 1;

                        var objectElement = createAsset('object');
                        objectElement.addClass('object').css({
                            'background-image': "url('" + spriteImageUrl + "')",
                            'width': object.attr('w') + 'px',
                            'height': object.attr('h') + 'px',
                        }).attr('title', objectId).attr('ref', object.attr('id'));

                        object.children().each(function(i, face) {
                            face = $(face);
                            if (face.is('animation')) {
                                var sprite = animationSpriteIndex[face.attr('ref')];
                            }
                            else {
                                return true;
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
                        objectIndex[objectId] = objectElement;

                        var clone = objectElement.clone();
                        assetApplyDraggable(clone);
                        $('.assets .sprites').append(clone);
                    });
                });

                level.find('level > layout').each(function(i, layoutXml) {
                    layoutXml = $(layoutXml);
                    layoutXml.find('solids > rect').each(function(i, solidXml) {
                        solidXml = $(solidXml);
                        var asset = createAsset('solid');
                        asset
                            .addClass('solid rect')
                            .css({
                                'left': solidXml.attr('x') + 'px',
                                'top': solidXml.attr('y') + 'px',
                                'width': solidXml.attr('w') + 'px',
                                'height': solidXml.attr('h') + 'px',
                            });
                        workspace.items.addItem(asset);
                    });

                    layoutXml.find('object').each(function(i, object) {
                        object = $(object);
                        var objectRef = object.attr('ref');
                        var clone = objectIndex[objectRef].clone();
                        clone.css({
                            'left': object.attr('x') + 'px',
                            'top': object.attr('y') + 'px',
                        });
                        workspace.items.addItem(clone);
                    });

                    layoutXml.find('> background').each(function(i, backgroundXml) {
                        backgroundXml = $(backgroundXml);
                        var x = parseFloat(backgroundXml.attr('x'));
                        var y = parseFloat(backgroundXml.attr('y'));
                        var w = parseFloat(backgroundXml.attr('w'));
                        var h = parseFloat(backgroundXml.attr('h'));
                        var background = new BackgroundManager.Background(x, y, w, h,
                            w / parseFloat(backgroundXml.attr('w-segments')),
                            h / parseFloat(backgroundXml.attr('h-segments')));

                        backgroundXml.find('> sprite').each(function(i, tileXml) {
                            tileXml = $(tileXml);
                            var ref = tileXml.attr('ref');
                            var tile = levelEdit.tileManager.getTile(ref);
                            tileXml.find('> segment').each(function(i, segmentXml) {
                                segmentXml = $(segmentXml);
                                var range = {
                                    'x': expandRange(segmentXml.attr('x'), background.getWidthSegs()),
                                    'y': expandRange(segmentXml.attr('y'), background.getHeightSegs()),
                                };

                                var i, j, x, y, faceIndex;
                                for (j in range.y) {
                                    y = range.y[j] - 1;
                                    for (i in range.x) {
                                        x = range.x[i] - 1;
                                        background.setTile(x, y, tile);
                                    }
                                }
                            });
                        });

                        levelEdit.backgroundManager.addBackground(x, y, background);
                        workspace.items.addItem(background.createElement());
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
        img.onerror = function() {
            alert("Could not load " + this.src);
        }
        img.src = url;
    }

    levelEdit.tileManager = new TileManager();

    levelEdit.objectManipulator = new ObjectManipulator();
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

    var controlPanelForm = $('form#controlpanel');
    controlpanel.on("click", "button", function(e) {
        e.preventDefault();
        var form = controlPanelForm;
        switch(this.name) {
            case "loadXml":
                if (confirm("Sure you want to load XML?")) {
                    var xmlUrl = form.find('input[name=xmlUrl]').val();
                    if (xmlUrl) {
                        loadXML(xmlUrl);
                    }
                }
                break;
            case "loadTemplate":
                var input = form.find('input[name=templateUrl]');
                var templateUrl = input.val();
                if (templateUrl) {
                    updateTemplate(templateUrl);
                }
                else {
                    alert("No template defined");
                }
                break;
        }
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
        switch (levelEdit.objectManipulator.mode) {
            case 'size':
                levelEdit.objectManipulator.nudgeSize(0, -16);
                break;
            default:
                levelEdit.objectManipulator.nudge(0, -16);
                break;
        }
    });
    // Down
    keyboard.hit(40, function() {
        switch (levelEdit.objectManipulator.mode) {
            case 'size':
                levelEdit.objectManipulator.nudgeSize(0, 16);
                break;
            default:
                levelEdit.objectManipulator.nudge(0, 16);
                break;
        }
    });
    // Left
    keyboard.hit(37, function() {
        switch (levelEdit.objectManipulator.mode) {
            case 'size':
                levelEdit.objectManipulator.nudgeSize(-16, 0);
                break;
            default:
                levelEdit.objectManipulator.nudge(-16, 0);
                break;
        }
    });
    // Right
    keyboard.hit(39, function() {
        switch (levelEdit.objectManipulator.mode) {
            case 'size':
                levelEdit.objectManipulator.nudgeSize(16, 0);
                break;
            default:
                levelEdit.objectManipulator.nudge(16, 0);
                break;
        }
    });
    keyboard.hit(46, function() {
        levelEdit.objectManipulator.remove();
    });
    keyboard.hit(77, function() {
        levelEdit.objectManipulator.mode = 'move';
    });
    keyboard.hit(83, function() {
        levelEdit.objectManipulator.mode = 'size';
    })


    $(':input').on('focus', function() {
        keyboard.enabled = false;
    }).on('blur', function() {
        keyboard.enabled = true;
    });

    $('button#generateXml').on('click', function(e) {
        e.preventDefault();
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
});
var levelEdit = {};
