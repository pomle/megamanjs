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

    this.marker.position.set(0,0,0);

    this.overlays = new THREE.Scene();

    this.layers = [
        this.guides,
        this.overlays,
    ];

    this.layers.guides = this.guides;
    this.layers.overlays = this.overlays;

    this.scene = undefined;

    this.ui.palette.html('');
}

Editor.prototype.getXML = function()
{
    return this.document[0].outerHTML;
}

Editor.prototype.loadUrl = function(url)
{
    const loader = new Game.Loader.XML(this.game);
    return loader.asyncLoadXML(url).then(doc => {
        const parser = new Game.Loader.XML.LevelParser(loader, doc.children[0]);
        return this.open(parser);
    });
}


Editor.prototype.open = function(parser)
{
    if (!(parser instanceof Game.Loader.XML.LevelParser)) {
        throw new TypeError('Expected LevelParser');
    }

    this.clear();

    return parser.getScene().then(scene => {
        this.document = $(parser._node);
        this.nodeManager.document = this.document;
        this.setupScene(scene);
        this.setupObjects(parser);
        this.setupSceneCheckpoints();
        this.setupSceneCamera();
        this.buildPalette(parser);
    });
}

Editor.prototype.setupScene = function(scene)
{
    this.scene = scene;
    this.scene.timer.isSimulating = false;
    this.scene.world.updateTime(0);
    this.game.setScene(scene);
    this.game.pause();
}

Editor.prototype.setupObjects = function(parser)
{
    parser._layoutObjects.forEach(o => {
        const i = new Editor.Item.Object(o.instance, o.node, o.sourceNode);
        this.items.add(i);
    });

    /*for (let _item of parser.behaviors) {
        let item = new Editor.Item.Behavior(_item.object, _item.node);
        editor.items.add(item);
    }*/

}

Editor.prototype.setupSceneCheckpoints = function()
{
    const nodes = this.document.find('> checkpoints > checkpoint');
    this.scene.checkPoints.forEach((chkp, i) => {
        const item = new Editor.Item.Checkpoint(chkp, nodes[i]);
        editor.items.add(item);
    });
}

Editor.prototype.setupSceneCamera = function()
{
    const factory = new Editor.ItemFactory();
    const camera = this.camera.realCamera;
    camera.far = 4000;
    camera.position.z = 300;
    camera.updateProjectionMatrix();
    if (this.scene.checkPoints.length) {
        this.camera.camera.jumpTo(this.scene.checkPoints[0].pos);
    }

    const nodes = this.document.find('> camera > path');
    this.scene.camera.paths.forEach((path, i) => {
        this.componentFactory.createCameraPath($(nodes[i]), path);
    });
}

Editor.prototype.buildPalette = function(parser)
{
    this.document.find('> objects').each(function() {
        const txtNode = $(this).find('> textures > texture');
        const url = parser.resolveURL(txtNode[0]);
        const totalW = parseInt(txtNode.attr('w'), 10);
        const totalH = parseInt(txtNode.attr('h'), 10);

        $(this).find('> animations > animation').each(function() {
            const anim = $(this);
            const name = anim.attr('id');

            anim.find('> frame:first-child').each(function() {
                const frameNode = this,
                    x = parser.getFloat(frameNode, 'x') + 1,
                    y = parser.getFloat(frameNode, 'y') + 1,
                    w = parser.getFloat(frameNode, 'w'),
                    h = parser.getFloat(frameNode, 'h');

                const item = $('<div class="animation">');
                item.css({
                    'background-image': 'url(' + url + ')',
                    'background-position': -x + 'px ' + -y + 'px',
                    'height': h,
                    'width': w,
                });
                const uvcoords = new Engine.UVCoords({x, y}, {x: w, y: h}, {x: totalW, y: totalH});
                item.data('uv-coords', uvcoords);
                item.attr('name', name);
                editor.ui.palette.append(item);
            });
        });
    });
}

Editor.prototype.renderOverlays = function()
{
    const renderer = this.game.renderer;
    const camera = this.camera.realCamera;
    //renderer.render(this.scene.world, camera);
    this.layers.forEach(layer =>{
        if (layer.visible) {
            renderer.clearDepth();
            renderer.render(layer, camera);
        }
    });
}
