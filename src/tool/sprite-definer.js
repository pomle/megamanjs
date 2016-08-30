$(function() {
    var workspace = $(".workspace"),
        controlpanel = $(".controlpanel");

    workspace.grabbed = undefined;
    workspace.keyboardActive = true;
    workspace.selected = undefined;
    workspace.select = function(slice) {
        this.deselect();
        this.selected = slice;
        var _this = this;
        slice.addClass('selected')
            .siblings()
            .removeClass('selected');

        $.each(controlpanel.inputs, function(key, input) {
            input.val(_this.selected.data(key));
        });
    }
    workspace.deselect = function() {
        if (!this.selected) {
            return;
        }
        var _this = this;
        $.each(controlpanel.inputs, function(key, input) {
            _this.selected.data(key, input.val());
        });
        this.selected = undefined;
    }

    var zoom = workspace.find('.zoom');
    zoom.level = 1;

    var canvas = zoom.find('canvas');

    workspace.console = $('#console');

    controlpanel.inputs = {};
    controlpanel.map = {'x': 'left', 'y': 'top', 'w': 'width', 'h': 'height'}
    controlpanel.find('.properties :input').each(function() {
        var input = $(this);
        controlpanel.inputs[this.name] = input;
        input.on('keyup', function controlPanelInputHandler(e) {
            if (workspace.selected) {
                var s = workspace.selected,
                    m = controlpanel.map;
                if (m[this.name]) {
                    s.css(m[this.name], parseFloat(this.value));
                }
            }
        });
    });

    controlpanel
        .find('button[name=generate]').on('click', function(e) {
            var counter = 0;

            var textureXml = $('<texture/>')
                .attr({
                    'id': 'texture-id',
                    'url': canvas.data('url'),
                    'w': parseFloat(canvas.css('width')),
                    'h': parseFloat(canvas.css('height')),
                });

            var animationsXml = $('<animations>');

            var animations = {};
            workspace.find('.slice').each(function() {
                var slice = $(this);
                var frameXml = $('<frame>')
                    .attr({
                        'x': parseFloat(slice.css('left')),
                        'y': parseFloat(slice.css('top')),
                        'w': parseFloat(slice.css('width')),
                        'h': parseFloat(slice.css('height')),
                        'duration': parseFloat(slice.data('duration')) || undefined,
                    });
                var name = slice.data('id') || 'slice_' + counter++;
                if (!animations[name]) {
                    animations[name] = $('<animation>').
                        attr({
                            'id': name,
                        });
                    animationsXml.append(animations[name]);
                }
                animations[name].append(frameXml);
            });
            var xml = (new XMLSerializer()).serializeToString($('<document>').append(animationsXml)[0]);
            xml = vkbeautify.xml(xml);
            workspace.console.val(xml);
        });

    function render(src) {
        var image = new Image();
        image.onload = function() {
            var cnv = canvas.get(0);
            cnv.width = this.width;
            cnv.height = this.height;
            var ctx = cnv.getContext("2d");
            ctx.clearRect(0, 0, this.width, this.height);
            ctx.drawImage(image, 0, 0);
        };
        image.src = src;
    }

    workspace.on('dragenter', function (e) {
        e.stopPropagation();
        e.preventDefault();
    });
    workspace.on('dragover', function (e) {
         e.stopPropagation();
         e.preventDefault();
    });
    workspace.on('drop', function (e) {
        e.preventDefault();
        var files = e.originalEvent.dataTransfer.files;
        var file = files[0];
        canvas.data('url', file.name);
        var reader = new FileReader();
        reader.onload = function(e){
            render(e.target.result);
        };
        reader.readAsDataURL(file);
    });
    workspace.console.on('paste', function(e) {
        var data = e.originalEvent.clipboardData.getData('text/plain');
        try {
            var xml = jQuery.parseXML(data);
            var domXml = $(xml).find('animations');
        }
        catch (e) {
            console.info("Paste not parsable", data);
            throw e;
            return;
        }

        if (domXml.length) {
            e.preventDefault();
            var size = {
                'w': parseFloat(domXml.attr('w')),
                'h': parseFloat(domXml.attr('h')),
            }
            domXml.find('animation').each(function() {
                var animationNode = $(this);
                animationNode.find('frame').each(function() {
                    var frameNode = $(this);

                    var slice = $('<div class="slice">')
                        .css({
                            'left': parseFloat(frameNode.attr('x')),
                            'top': parseFloat(frameNode.attr('y')),
                            'height': (parseFloat(frameNode.attr('h')) || size.y),
                            'width': (parseFloat(frameNode.attr('w')) || size.x),
                        });

                    $.each(controlpanel.inputs, function(key, input) {
                        slice.data(key, frameNode.attr(key) || animationNode.attr(key));
                    });

                    zoom.append(slice);
                });
            });
        }
    });
    workspace
        .on('click', '.slice', function(e) {
            e.stopPropagation();

        })
        .on('mousedown', '.slice', function(e) {
            workspace.select($(this));
            e.stopPropagation();
            if (focusedInput) {
                focusedInput.focus();
                e.preventDefault();
            }
        })
        .on('mouseup', '.slice', function(e) {
        })
        .on('click', '.zoom', function(e) {
            var slice = $('<div class="slice">')
                .css({
                    'left': Math.floor(e.offsetX / zoom.level),
                    'top': Math.floor(e.offsetY / zoom.level),
                });
            zoom.append(slice);
            slice.trigger('mousedown');
        })

    var nudgeMap = {
        37: {x: -1, y: 0},
        38: {x: 0, y: -1},
        39: {x: 1, y: 0},
        40: {x: 0, y: 1},
    }

    var focusedInput = undefined;
    $(':input').on('focus', function() {
        workspace.keyboardActive = false;
        focusedInput = $(this);
    })
    .on('blur', function() {
        workspace.keyboardActive = true;
    });

    $(window).on('keydown', function(e) {
        if (e.which !== 27 && !workspace.keyboardActive) {
            return;
        }

        e.preventDefault();
        switch (e.which) {
            case 27:
                if (focusedInput) {
                    focusedInput.blur();
                    focusedInput = undefined;
                }
                break;
            case 107: // +
                zoom.css('zoom', ++zoom.level);
                break;
            case 109: // -
                zoom.css('zoom', zoom.level > 1 ? --zoom.level : zoom.level);
                break;
            case 46: // Del
                if (workspace.selected) {
                    workspace.selected.remove();
                    workspace.deselect();
                }
                break;
            case 37:
            case 38:
            case 39:
            case 40:
                if (workspace.selected) {
                    var slice = workspace.selected;
                    var nudge = nudgeMap[e.which];

                    if (e.shiftKey) {
                        slice.css({
                            'width' : parseFloat(slice.css('width'))  + nudge.x,
                            'height': parseFloat(slice.css('height')) + nudge.y,
                        });
                    }
                    else {
                        slice.css({
                            'left': parseFloat(slice.css('left')) + nudge.x,
                            'top' : parseFloat(slice.css('top'))  + nudge.y,
                        });
                    }
                }
                break;
            case 84:
                controlpanel.inputs.slice_name.focus();
                break;
        }
    });
});

