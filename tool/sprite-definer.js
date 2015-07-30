$(function() {
    var workspace = $(".workspace");
    workspace.grabbed = undefined;
    workspace.keyboardActive = true;
    workspace.selected = undefined;
    workspace.select = function(slice) {
        this.selected = slice;
        slice.addClass('selected')
            .siblings()
            .removeClass('selected');
        controlpanel.inputs.slice_name.val(this.selected.attr('name'));
    }
    workspace.deselect = function() {
        this.selected = undefined;
        controlpanel.inputs.slice_name.val('');
    }

    var zoom = workspace.find('.zoom');
    zoom.level = 1;

    var canvas = zoom.find('canvas');

    var controlpanel = $(".controlpanel");
    controlpanel.inputs = {
        slice_name: controlpanel.find('input[name=slice_id]'),
    }

    controlpanel
        .find('button[name=generate]').on('click', function(e) {
            var spritesXml = $('<sprites/>')
                .attr({
                    'url': canvas.data('url'),
                    'w': parseFloat(canvas.css('width')),
                    'h': parseFloat(canvas.css('height')),
                });

            workspace.find('.slice').each(function() {
                var slice = $(this);
                var spriteXml = $('<sprite/>')
                    .attr({
                        'id': slice.attr('name'),
                        'x': parseFloat(slice.css('left')),
                        'y': parseFloat(slice.css('top')),
                        'w': parseFloat(slice.css('width')),
                        'h': parseFloat(slice.css('height')),
                    });

                spritesXml.append(spriteXml);
            });

            $('#console').val(spritesXml[0].outerHTML);
        });

    controlpanel.inputs.slice_name.on('keyup', function() {
        if (workspace.selected) {
            var name = $(this).val();
            workspace.selected.attr({
                'name': name,
                'title': name,
            });
        }
    });


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

    workspace
        .on('click', '.slice', function(e) {
            e.stopPropagation();
        })
        .on('mousedown', '.slice', function(e) {
            workspace.select($(this));
            e.stopPropagation();
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
            workspace.select(slice);
        })

    var nudgeMap = {
        37: {x: -1, y: 0},
        38: {x: 0, y: -1},
        39: {x: 1, y: 0},
        40: {x: 0, y: 1},
    }

    $(':input').on('focus', function() {
        workspace.keyboardActive = false;
    })
    .on('blur', function() {
        workspace.keyboardActive = true;
    });

    $(window).on('keydown', function(e) {
        if (!workspace.keyboardActive) {
            return;
        }

        console.log(e.which);
        e.preventDefault();
        switch (e.which) {
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

