"use strict";

var Editor = function()
{
    this.camera = new Editor.Camera(this);

    this.clipboard = new Editor.Clipboard();

    this.componentFactory = new Editor.ComponentFactory(this);

    this.document = undefined;

    this.modes = new Editor.Modes(this);
    this.activeMode = this.modes.view;

    this.game = undefined;

    this.grid = new THREE.GridHelper(32, 1);
    this.grid.setColors(0x00ffff, 0xa0c3d2);
    this.grid.rotation.x = Math.PI / 2;
    this.grid.material.opacity = .22;
    this.grid.material.transparent = true;
    this.grid.scale.multiplyScalar(8);
    this.grid.snap = false;
    this.grid.snapVector = function(vec) {
        let components = ['x','y'];
        for (let c of components) {
            let s = this.scale[c],
                v = vec[c];
            vec[c] = s * Math.round(v / s);
        }
        return vec;
    }

    this.itemFactory = new Editor.ItemFactory();

    this.marker = new THREE.Mesh(
        new THREE.SphereGeometry(5, 2, 2),
        new THREE.MeshBasicMaterial({color: 0x00ffff, wireframe: true}));

    this.modelManager = new Editor.ModelManager(this);

    this.nodeFactory = new Editor.NodeFactory(this);
    this.nodeManager = new Editor.NodeManager();

    this.parser = undefined;

    this.ui = undefined;
}

Editor.Colors = {
    behavior: 0xaf2896,
    cameraConstraint: 0x00ffff,
    cameraWindow: 0x5ff550,
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

Editor.prototype.clear = function()
{
    this.items = new Editor.ItemSet(this);

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

    this.ui.palette.html('');
}

Editor.prototype.getXML = function()
{
    return editor.document[0].outerHTML;
}

Editor.prototype.loadUrl = function(url, callback)
{
    let editor = this,
        loader = new Game.Loader.XML(editor.game);
    loader.load(url, function(node) {
        editor.load(node, callback);
    });
}

Editor.prototype.load = function(node, callback)
{
    let editor = this,
        parser = new Game.Loader.XML.Parser.LevelParser(this);

    node = $(node);
    console.log(node);
    parser.parse(node, function(level, parser) {
        editor.open(level, parser);
        if (callback) {
            callback();
        }
    });
}

Editor.prototype.open = function(level, parser)
{
    this.clear();

    let editor = this,
        game = editor.game,
        componentFactory = editor.componentFactory;

    editor.parser = parser;

    editor.marker.position.set(0,0,0);

    editor.document = parser.node;
    editor.nodeManager.document = editor.document;

    level.events.unbind(level.EVENT_START, level.resetPlayer);

    game.engine.isSimulating = false;
    game.setScene(level);
    game.engine.world.updateTime(0);

    var factory = new Editor.ItemFactory();

    level.camera.camera.far = 4000;
    level.camera.camera.position.z = 300;
    level.camera.camera.updateProjectionMatrix();
    if (level.checkPoints.length) {
        let checkPointNodes = editor.document.find('> checkpoints > checkpoint');

        for (let i = 0, l = level.checkPoints.length; i < l; ++i) {
            let item = new Editor.Item.Checkpoint(level.checkPoints[i], checkPointNodes[i]);
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
            componentFactory.createCameraPath(n, p);
        }
    }

    for (let _item of parser.items) {
        let item = new Editor.Item.Object(_item.object, _item.node);
        editor.items.add(item);
    }

    for (let _item of parser.behaviors) {
        console.log(_item.object.position);
        let item = new Editor.Item.Behavior(_item.object, _item.node);
        editor.items.add(item);
    }

    editor.document.find('> objects').each(function() {
        let url = parser.getAbsoluteUrl($(this).find('> textures > texture'));
        $(this).find('> animations > animation').each(function() {
            let anim = $(this),
                name = anim.attr('id');

            anim.find('> frame:first-child').each(function() {
                let frame = $(this),
                    x = parseFloat(frame.attr('x')),
                    y = parseFloat(frame.attr('y')),
                    w = parseFloat(frame.attr('w')),
                    h = parseFloat(frame.attr('h'));
                let item = $('<div class="animation">');
                item.css({
                    'background-image': 'url(' + url + ')',
                    'background-position': -x + 'px ' + -y + 'px',
                    'height': h,
                    'width': w,
                });
                item.attr('name', name);
                editor.ui.palette.append(item);
            });
        });
    });
}

Editor.prototype.renderOverlays = function()
{
    let engine = this.game.engine,
        camera = engine.world.camera.camera;

    for (let i = 0, l = this.layers.length; i !== l; ++i) {
        let layer = this.layers[i];
        if (layer.visible) {
            engine.renderer.clearDepth();
            engine.renderer.render(layer, camera);
        }
    }
}
