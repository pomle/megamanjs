var Game = function()
{
    this.debugger = undefined;

    this.engine = new Engine(new THREE.WebGLRenderer({
        'antialias': false,
    }));

    this.hud = new Hud(this);
    this.player = new Game.Player();
    this.player.hud = this.hud;

    this.resource = new Game.ResourceManager();

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
}

Game.objects = {};
Game.scenes = {};
Game.traits = {};

Game.prototype.attachToElement = function(element)
{
    this.element = element;

    this.hud.elements = {
        'healthBar': element.querySelector('.health'),
        'weaponBar': element.querySelector('.weapon'),
        'bossHealthBar': element.querySelector('.bossHealth'),
    }

    this.adjustResolution();

    this.element.appendChild(this.engine.renderer.domElement);
}

Game.prototype.adjustAspectRatio = function()
{
    if (this.scene.world) {
        var rect = this.element.getBoundingClientRect();
        var cam = this.scene.world.camera.camera;
        cam.aspect = rect.width / rect.height;
        cam.updateProjectionMatrix();
    }
}

Game.prototype.adjustResolution = function()
{
    var rect = this.element.getBoundingClientRect();
    this.setResolution(rect.width, rect.height);
}

Game.prototype.setResolution = function(w, h)
{
    this.engine.renderer.setSize(w, h);
    this.engine.renderer.domElement.removeAttribute("style");
}

Game.prototype.setScene = function(scene)
{
    if (scene instanceof Game.Scene === false) {
        throw new Error('Invalid scene');
    }

    if (this.scene) {
        this.scene.__destroy();
        this.scene = undefined;
        this.engine.unsetWorld();
    }

    scene.__create();
    this.scene = scene;
    this.engine.setWorld(this.scene.world);

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

