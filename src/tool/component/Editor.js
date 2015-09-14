"use strict";

var Editor = function()
{
    this.clipboard = new Editor.Clipboard();

    this.document = undefined;

    this.game = undefined;

    this.grid = new THREE.Vector3(16, 16, 1);

    this.items = new Editor.ItemSet();

    this.marker = new THREE.Mesh(
        new THREE.SphereGeometry(5, 2, 2),
        new THREE.MeshBasicMaterial({color: 0xff0000, wireframe: true}));

    this.modelManager = new Editor.ModelManager(this);

    this.workspace = $('<section class="workspace">');
    this.workspace.viewport = $('<div class="viewport">');
    this.workspace.append(this.workspace.viewport);
}

Editor.prototype.getXML = function()
{
    return editor.document[0].outerHTML;
}

Editor.prototype.loadLevel = function(src, callback)
{
    let editor = this,
        game = editor.game,
        loader = new Game.Loader.XML(game);

    loader.loadLevel(src, function(level, parser) {
        editor.marker.position.set(0,0,0);

        level.debug = true;
        level.events.unbind(level.EVENT_START, level.resetPlayer);

        level.camera.camera.far = 5000;
        if (level.checkPoints.length) {
            editor.marker.position.x = level.checkPoints[0].pos.x;
            editor.marker.position.y = level.checkPoints[0].pos.y;

            level.camera.jumpTo(level.checkPoints[0].pos);
        }

        game.engine.isSimulating = false;
        game.setScene(level);
        game.engine.world.updateTime(0);

        editor.modelManager.expose(editor.marker);

        editor.document = parser.node;
        editor.document.object = editor.document.find('> objects');
        editor.document.layout = editor.document.find('> layout');
        editor.document.layout.objects = editor.document.layout.find('> objects');

        editor.items.clear();

        for (var item of parser.items) {
            var item = new Editor.Item(item.object, item.node);
            editor.items.add(item);
        }


        if (callback) {
            callback();
        }
    });

    return loader;
}
