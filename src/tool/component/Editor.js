"use strict";

var Editor = function()
{
    this.clipboard = new Editor.Clipboard();

    this.document = undefined;

    this.game = undefined;

    this.grid = new THREE.Vector3(16, 16, 1);

    this.items = new Editor.ItemSet(this);

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
        editor.items.clear();
        editor.marker.position.set(0,0,0);

        editor.document = parser.node;
        editor.document.object = editor.document.find('> objects');
        editor.document.layout = editor.document.find('> layout');
        editor.document.layout.objects = editor.document.layout.find('> objects');

        level.debug = true;
        level.events.unbind(level.EVENT_START, level.resetPlayer);

        var factory = new Editor.ItemFactory();

        level.camera.camera.far = 5000;
        if (level.checkPoints.length) {
            let checkPointNodes = editor.document.find('> checkpoints > checkpoint');

            for (let i = 0, l = level.checkPoints.length; i < l; ++i) {
                let cp = level.checkPoints[i];
                let item = factory.create('checkpoint', checkPointNodes[i])(cp.pos.x, cp.pos.y, cp.radius);
                editor.items.add(item);
            }

            editor.marker.position.x = level.checkPoints[0].pos.x;
            editor.marker.position.y = level.checkPoints[0].pos.y;

            level.camera.jumpTo(level.checkPoints[0].pos);
        }

        if (level.camera.paths.length) {
            let pathNodes = editor.document.find('> camera > path');

            console.log(pathNodes);

            for (let i = 0, l = level.camera.paths.length; i < l; ++i) {
                let p = level.camera.paths[i],
                    n = $(pathNodes[i]);

                let windowItem = factory.create('cameraWindow', n.find('> window'))(p.window);
                windowItem.object.position.z = 0;
                editor.items.add(windowItem);

                let constraintItem = factory.create('cameraConstraint', n.find('> constraint'))(p.constraint);
                constraintItem.object.position.z = windowItem.object.position.z + 1;
                editor.items.add(constraintItem);
            }
        }

        game.engine.isSimulating = false;
        game.setScene(level);
        game.engine.world.updateTime(0);

        editor.modelManager.expose(editor.marker);

        for (let _item of parser.items) {
            let item = new Editor.Item(_item.object, _item.node);
            item.type = 'object';
            editor.items.add(item);
        }


        if (callback) {
            callback();
        }
    });

    return loader;
}
