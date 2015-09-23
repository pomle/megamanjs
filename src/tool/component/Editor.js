"use strict";

var Editor = function()
{
    this.camera = new Editor.Camera(this);

    this.clipboard = new Editor.Clipboard();

    this.componentFactory = new Editor.ComponentFactory(this);

    this.document = undefined;

    this.game = undefined;

    this.grid = new THREE.GridHelper(32, 1);
    this.grid.setColors(0xff6437, 0xa0c3d2);
    this.grid.rotation.x = Math.PI / 2;
    this.grid.material.opacity = .5;
    this.grid.material.transparent = true;
    this.grid.scale.multiplyScalar(16);

    this.items = new Editor.ItemSet(this);

    this.itemFactory = new Editor.ItemFactory();

    this.marker = new THREE.Mesh(
        new THREE.SphereGeometry(5, 2, 2),
        new THREE.MeshBasicMaterial({color: Editor.Colors.marker, wireframe: true}));

    this.modelManager = new Editor.ModelManager(this);

    this.nodeFactory = new Editor.NodeFactory(this);

    this.guides = new THREE.Scene();
    this.guides.add(this.marker);
    this.guides.add(this.grid);

    this.overlays = new THREE.Scene();

    this.layers = [
        this.guides,
        this.overlays,
    ];

    this.layers.guides = this.guides;
    this.layers.overlays = this.overlays;

    this.parser = undefined;

    this.ui = undefined;
}

Editor.Colors = {
    behavior: 0xaf2896,
    cameraConstraint: 0x00ffff,
    cameraWindow: 0x19e68c,
    checkpoint: 0xeb1e32,
    marker: 0xf037a5,
    overlayEdit: 0x5ff550,
    overlayPaint: 0x509bf5,
}

Editor.prototype.attachGame = function(game)
{
    let editor = this,
        engine = game.engine,
        overlays = this.guides;

    this.game = game;
    game.attachToElement(this.ui.viewport[0]);

    engine.renderer.autoClear = false;
    engine.events.bind(engine.EVENT_RENDER, this.renderOverlays.bind(this));
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
                let item = factory.create('checkpoint', checkPointNodes[i])(level.checkPoints[i]);
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

Editor.prototype.renderOverlays = function()
{
    let engine = this.game.engine,
        camera = engine.world.camera.camera,
        grid = this.grid;

    grid.position.copy(camera.position);
    grid.position.x -= grid.position.x % grid.scale.x;
    grid.position.y -= grid.position.y % grid.scale.y;
    grid.position.z = 0;

    for (let i = 0, l = this.layers.length; i !== l; ++i) {
        let layer = this.layers[i];
        if (layer.visible) {
            engine.renderer.clearDepth();
            engine.renderer.render(layer, camera);
        }
    }
}