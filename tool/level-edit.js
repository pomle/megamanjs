$(function() {
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

                        $('.assets .sprites').append(spriteElement);
                        spriteElement.draggable({
                            start: function() { workspace.droppable("enable"); },
                            stop: function() { workspace.droppable("disable"); },
                            revert: true,
                            revertDuration: 0,
                            helper:'clone',
                            appendTo:'body',
                        });
                    });
                    /*

                    <sprite id="drwily-sign-blue">
            <bounds x="64" y="16" w="32" h="32"/>
        </sprite>*/
                });
            },
        });
    }

    function updateTemplate(url)
    {
        var img = new Image();
        img.onload = function() {
            grid.css({
                'background-image': "url('" + this.src + "')",
                'height': this.height + 'px',
                'width': this.width + 'px',
            });
        }
        img.src = url;
    }


    var workspace = $('.workspace');
    var grid = workspace.find('.grid');

    var controlpanel = $('.controlpanel');

    workspace.droppable({
        accept: '.sprite',
        tolerance: "fit",
        drop: function(event, ui) {
            console.dir(event);
            console.dir(ui);
            var sprite = ui.draggable.clone();
            sprite.draggable({
                containment: workspace,
                cursor: 'none',
                grid: [16,16],
            });
            workspace.find('.items').append(sprite);
        }
    }).droppable("disable");

    controlpanel.find('.zoom > button').on('click', function() {
        var zoom = workspace.find('.zoom');
        zoom.css('zoom', parseFloat(zoom.css('zoom')) * parseFloat($(this).data('mag')));
    });

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



    $('input[name=template').val('file:///C:/Users/Pom/Desktop/MegaManJS/tool/templates/flashman.png');
    $('#template').submit();
    $('input[name=xml').val('file:///C:/Users/Pom/Desktop/MegaManJS/src/levels/flashman/Flashman.xml');
    $('#xml').submit();

});
