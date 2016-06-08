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

    this.itemFactory = new Editor.ItemFactory();

    this.marker = new THREE.Mesh(
        new THREE.SphereGeometry(5, 2, 2),
        new THREE.MeshBasicMaterial({color: 0x00ffff, wireframe: true}));

    this.modelManager = new Editor.ModelManager(this);

    this.nodeFactory = new Editor.NodeFactory(this);
    this.nodeManager = new Editor.NodeManager();

    this.parser = undefined;

    this.ui = new Editor.UI(this);


    let grid = this.grid,
        ui = this.ui;

    this.marker.moveTo = function(pos) {
        this.position.copy(pos);
        if (grid.snap) {
            grid.snapVector(this.position);
        }
        this.position.z = 0;
        ui.viewport.coords.find('.x > .value').text(this.position.x.toFixed(2));
        ui.viewport.coords.find('.y > .value').text(this.position.y.toFixed(2));
    }

    this.grid.snapVector = function(vec) {
        let components = ['x','y'],
            round
        for (let c of components) {
            let s = this.scale[c],
                v = vec[c],
                i = s * Math.round(v / s);
            vec[c] = Engine.Math.round(i, 8);
        }
        return vec;
    }
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
    this.game = game;
    game.renderer.autoClear = false;
    game.attachToElement(this.ui.viewport[0]);
    game.events.bind(game.EVENT_SCENE_CREATE, scene => {
        const timer = scene.timer;
        timer.events.bind(timer.EVENT_RENDER, this.renderOverlays.bind(this));
    });
}

Editor.prototype.clear = function()
{
    this.items = new Editor.ItemSet(this);

    this.guides = new THREE.Scene();
    var light = new THREE.AmbientLight(0xffffff);
    this.guides.add(light);

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
    return this.document[0].outerHTML;
}

Editor.prototype.loadUrl = function(url)
{
    const loader = new Game.Loader.XML(this.game);
    let node;
    return loader.asyncLoadXML(url)
        .then(doc => {
            node = doc.children[0];
            return loader.parseScene(node);
        })
        .then(scene => {
            this.open(scene, loader, node);
        });
}


Editor.prototype.open = function(level, loader, node)
{
    this.clear();

    let editor = this,
        game = editor.game,
        componentFactory = editor.componentFactory;

    editor.marker.position.set(0,0,0);

    editor.document = node;
    editor.nodeManager.document = editor.document;

    let objectParser = new Game.Loader.XML.Parser.ObjectParser(loader);
    objectParser.parse(editor.document.querySelector(':scope > objects'));

    editor.document.objectSources = {};
    for (let item of objectParser.items) {
        editor.document.objectSources[item.object.name] = item;
    }

    let objectNodeMap = {};
    editor.document.find('> objects > object').each(function() {
        let objectNode = $(this);
        objectNodeMap[objectNode.attr('id')] = objectNode;
    });

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
        let item = new Editor.Item.Object(_item.object, _item.node, objectNodeMap[_item.object.name]);
        editor.items.add(item);
    }

    for (let _item of parser.behaviors) {
        let item = new Editor.Item.Behavior(_item.object, _item.node);
        editor.items.add(item);
    }

    editor.document.find('> objects').each(function() {
        let textureNode = $(this).find('> textures > texture'),
            url = parser.getAbsoluteUrl(textureNode),
            totalW = parseFloat(textureNode.attr('w')),
            totalH = parseFloat(textureNode.attr('h'));

        $(this).find('> animations > animation').each(function() {
            let anim = $(this),
                name = anim.attr('id');

            anim.find('> frame:first-child').each(function() {
                let frame = $(this),
                    x = parseFloat(frame.attr('x')) + 1,
                    y = parseFloat(frame.attr('y')) + 1,
                    w = parseFloat(frame.attr('w')),
                    h = parseFloat(frame.attr('h'));
                let item = $('<div class="animation">');
                item.css({
                    'background-image': 'url(' + url + ')',
                    'background-position': -x + 'px ' + -y + 'px',
                    'height': h,
                    'width': w,
                });
                let uvcoords = new Engine.UVCoords(x, y, w, h, totalW, totalH);
                item.data('uv-coords', uvcoords);
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
