"use strict";

var Editor = function()
{
    this.camera = new Editor.Camera(this);

    this.clipboard = new Editor.Clipboard();

    this.componentFactory = new Editor.ComponentFactory(this);

    this.document = undefined;

    this.game = undefined;

    this.grid = new THREE.Vector3(16, 16, 1);

    this.items = new Editor.ItemSet(this);

    this.itemFactory = new Editor.ItemFactory();

    this.marker = new THREE.Mesh(
        new THREE.SphereGeometry(5, 2, 2),
        new THREE.MeshBasicMaterial({color: Editor.Colors.marker, wireframe: true}));

    this.modelManager = new Editor.ModelManager(this);

    this.nodeFactory = new Editor.NodeFactory(this);

    this.overlays = new THREE.Scene();
    this.overlays.add(this.marker);

    this.parser = undefined;

    this.ui = undefined;
}

Editor.Colors = {
    behavior: 0xaf2896,
    cameraConstraint: 0x00ffff,
    cameraWindow: 0x19e68c,
    checkpoint: 0x8c1932,
    marker: 0xf037a5,
    overlayEdit: 0x5ff550,
    overlayPaint: 0x509bf5,
}

Editor.prototype.attachGame = function(game)
{
    let engine = game.engine,
        overlays = this.overlays;

    this.debugger = new Game.Debug(game);
    this.game = game;
    game.attachToElement(this.ui.viewport[0]);

    engine.renderer.autoClear = false;
    engine.events.bind(engine.EVENT_RENDER, function() {
        engine.renderer.clearDepth();
        engine.renderer.render(overlays, engine.world.camera.camera);
    });
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

        game.engine.isSimulating = false;
        game.setScene(level);
        game.engine.world.updateTime(0);

        var factory = new Editor.ItemFactory();

        level.camera.camera.far = 5000;
        level.camera.camera.position.z = 300;
        if (level.checkPoints.length) {
            let checkPointNodes = editor.document.find('> checkpoints > checkpoint');

            for (let i = 0, l = level.checkPoints.length; i < l; ++i) {
                let cp = level.checkPoints[i];
                let item = factory.create('checkpoint', checkPointNodes[i])(cp.pos.x, cp.pos.y, cp.radius);
                item.position = cp.pos;
                editor.items.add(item);
            }

            editor.marker.position.x = level.checkPoints[0].pos.x;
            editor.marker.position.y = level.checkPoints[0].pos.y;

            level.camera.jumpTo(level.checkPoints[0].pos);
        }

        if (level.camera.paths.length) {
            let pathNodes = editor.document.find('> camera > path');

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

        for (let _item of parser.items) {
            let object = _item.object,
                node = _item.node,
                item = new Editor.Item(object, node);

            item.type = 'object';
            editor.items.add(item);
        }

        for (let _item of parser.behaviors) {
            let object = _item.object,
                node = _item.node;

            let model = new THREE.Mesh(
                object.collision[0].geometry,
                new THREE.MeshBasicMaterial({color: Editor.Colors['behavior'], wireframe: true})
            );
            object.model.add(model);

            let item = new Editor.Item(object, node);
            item.type = 'behavior';

            editor.items.add(item);
        }

        if (callback) {
            callback();
        }
    });

    return loader;
}
