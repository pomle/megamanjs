var Game = function()
{
    this.resources = new Game.ResourceManager();

    this.engine = undefined;
    this.player = undefined;

    this.scenes = {};

    this.level = undefined;

    window.addEventListener('focus', function() {
        if (this.engine && !this.engine.isRunning) {
            this.engine.run();
        }
    }.bind(this));
    window.addEventListener('blur', function() {
        if (this.engine && this.engine.isRunning) {
            this.engine.pause();
        }
    }.bind(this));

    this.sceneQueue = [];
}

Game.objects = {};
Game.scenes = {};
Game.traits = {};

Game.createFromXml = function(url, callback)
{
    var renderer = new THREE.WebGLRenderer({
        'antialias': false,
    });

    var game = new Game();
    game.engine = new Engine(renderer);
    game.player = new Game.Player();
    game.player.hud = new Hud($('#screen'));

    var loader = new Game.Loader(game);
    loader.loadGame(url, callback);

    return game;
}

Game.prototype.attachToElement = function(element)
{
    this.element = element;
    var rect = this.element.getBoundingClientRect();
    this.engine.renderer.setSize(rect.width, rect.height);
    this.engine.renderer.domElement.removeAttribute("style");
    this.element.appendChild(this.engine.renderer.domElement);
}

Game.prototype.adjustAspectRatio = function()
{
    if (this.engine.scene) {
        var rect = this.element.getBoundingClientRect();
        var cam = this.engine.scene.camera.camera;
        cam.aspect = rect.width / rect.height;
        cam.updateProjectionMatrix();
    }
}

Game.prototype.adjustResolution = function()
{
    var rect = this.element.getBoundingClientRect();
    this.engine.renderer.setSize(rect.width, rect.height);
}

Game.prototype.setScene = function(scene)
{
    if (scene instanceof Game.Scene === false) {
        throw new Error('Invalid scene');
    }

    if (this.scene) {
        this.scene.__destroy();
        this.scene = undefined;
        this.engine.scene = undefined;
    }

    scene.__create();
    this.scene = scene;
    this.engine.scene = this.scene.world;

    /* Because the camera is instantiated per scene,
       we make sure the aspect ratio is correct before
       we roll. */
    this.adjustAspectRatio();

    /* For some reason, if we start the engine immediately,
       the performance is sluggish. Deferring it to end of call queue
       fixes it. */
    var game = this;
    function start() {
        game.scene.__start();
    }

    setTimeout(start, 0);
}

