"use strict";

var Editor = function()
{
    this.clipboard = new Editor.Clipboard();

    this.document = undefined;

    this.game = undefined;

    this.grid = new THREE.Vector3(16, 16, 1);

    this.items = new Editor.ItemSet();

    this.marker = new THREE.Mesh(
        new THREE.SphereGeometry(5, 32, 32),
        new THREE.MeshBasicMaterial({color: 0xffff00}));

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
        editor.document = parser.node;
        editor.document.object = editor.document.find('> objects');
        editor.document.layout = editor.document.find('> layout');
        editor.document.layout.objects = editor.document.layout.find('> objects');

        editor.items.clear();

        for (var item of parser.items) {
            var item = new Editor.Item(item.object, item.node);
            editor.items.add(item);
        }

        level.debug = true;
        level.events.unbind(level.EVENT_START, level.resetPlayer);

        level.camera.camera.far = 5000;
        if (level.checkPoints.length) {
            level.camera.jumpTo(level.checkPoints[0].pos);
        }

        game.engine.isSimulating = false;
        game.setScene(level);
        game.engine.world.updateTime(0);

        if (callback) {
            callback();
        }
    });

    return loader;
}
