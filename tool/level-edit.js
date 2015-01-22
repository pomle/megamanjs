$(function() {
    var baseUrl = document.location.href.split('/').slice(0, -1).join('/');

    function assetApplyDraggable(elements)
    {
        elements.addClass('asset').draggable({
            start: function() { workspace.droppable("enable"); },
            stop: function() { workspace.droppable("disable"); },
            revert: true,
            revertDuration: 0,
            helper:'clone',
            appendTo: 'body',
        });
    }

    function zoomWorkspace(ratio)
    {
        zoom.css('zoom', parseFloat(zoom.css('zoom')) * ratio);
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
                'height': this.height + 'px',
                'width': this.width + 'px',
            })
            .children('.template').css({
                'background-image': "url('" + this.src + "')",
            });
        }
        img.src = url;
    }

    var objectMani = new ObjectManipulator();
    levelEdit.objectManipulator = objectMani;


    var workspace = $('.workspace');
    levelEdit.workspace = workspace;
    var grid = workspace.find('.grid');
    var zoom = workspace.find('.zoom');
    var controlpanel = $('.controlpanel');
    var assets = $('.assets');
    console.log(zoom);

    //var zoomAreaDraggable = Draggable.create('.workspace', {type:"scroll", edgeResistance:1});

    workspace.droppable({
        accept: '.asset',
        tolerance: "fit",
        drop: function(event, ui) {
            console.dir(event);
            console.dir(ui);
            var sprite = ui.draggable.clone();

            sprite.css({
                position: 'absolute',
            }).draggable({
                containment: workspace,
                //cursor: 'none',
                //start: zoomAreaDraggable.disable,
                stop: function(event, ui) {
                    levelEdit.objectManipulator.move(ui.position.left, ui.position.top);
                },
            });
            /*.resizable({
                grid: [16, 16],
            });*/

            workspace.find('.items').append(sprite);

            var zoomFactor = parseFloat(zoom.css('zoom')) || 1;
            var scrollFactor = [workspace.scrollLeft(), workspace.scrollTop()];
            var offsetFactor = [workspace.offset().left, workspace.offset().top];
            levelEdit.objectManipulator.select(sprite);
            levelEdit.objectManipulator.move(
                (ui.position.left + scrollFactor[0] - offsetFactor[0]) / zoomFactor,
                (ui.position.top + scrollFactor[1] - offsetFactor[1]) / zoomFactor);
        }
    }).droppable("disable");

    grid.children('.items').on('mousedown', '.asset', function(e) {
        levelEdit.objectManipulator.select($(this));
    });

    controlpanel.find('.zoom > button').on('click', function() {
        zoomWorkspace(parseFloat($(this).data('mag')));
    });

    workspace.on('mousewheel', function(e) {
        e.preventDefault();
        zoomWorkspace(e.originalEvent.deltaY < 0 ? 2 : .5);
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
    keyboard.intermittent(71, function() { zoomAreaDraggable.enable(); }, function() { zoomAreaDraggable.disable(); });
    keyboard.hit(65, function() { assets.toggle(); });
    keyboard.hit(38, function() { objectMani.nudge(0, -16); });
    keyboard.hit(40, function() { objectMani.nudge(0, 16); });
    keyboard.hit(37, function() { objectMani.nudge(-16, 0); });
    keyboard.hit(39, function() { objectMani.nudge(16, 0); });
    keyboard.hit(46, function() { objectMani.remove(); });


    $(':input').on('focus', function() {
        keyboard.enabled = false;
    }).on('blur', function() {
        keyboard.enabled = true;
    });

    $('button#generateXml').on('click', function() {
        var level = $('<level></level>');
        var items = workspace.find('.items');
        //items.find('.sprite')

        $('#console').html(level[0].outerHTML);
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
    this.quantize = 1;
    this.selectedObject = undefined;

    this.undo = [];
}

ObjectManipulator.prototype.nudge = function(x, y)
{
    var pos = this.pos();
    this.move(pos.x + x, pos.y + y);
}

ObjectManipulator.prototype.move = function(x, y)
{
    var pos = this.pos();
    this.selectedObject.style.left = (x - (x % this.quantize)) + 'px';
    this.selectedObject.style.top = (y - (y % this.quantize)) + 'px';
}

ObjectManipulator.prototype.pos = function()
{
    return {
        x: parseFloat(this.selectedObject.style.left) || 0,
        y: parseFloat(this.selectedObject.style.top) || 0,
    };
}

ObjectManipulator.prototype.remove = function()
{
    this.undo.push(this.selectedObject);
    this.selectedObject.parentNode.removeChild(this.selectedObject);
}

ObjectManipulator.prototype.select = function(object)
{
    object.addClass('selected').siblings().removeClass('selected');
    this.selectedObject = object.get(0);
}
