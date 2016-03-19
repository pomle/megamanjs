var Game = function()
{
    this.engine = undefined;

    this.loader = undefined;
    this.player = new Game.Player();
    this.player.hud = new Hud(this);

    this.resource = new Game.ResourceManager();
}

Game.objects = {};
Game.scenes = {};
Game.traits = {};

Game.prototype.attachController = function()
{
    window.addEventListener('keydown', this.handleInputEvent.bind(this));
    window.addEventListener('keyup', this.handleInputEvent.bind(this));
}

Game.prototype.attachToElement = function(element)
{
    this.element = element;

    this.player.hud.elements = {
        'healthBar': element.querySelector('.health'),
        'weaponBar': element.querySelector('.weapon'),
        'bossHealthBar': element.querySelector('.bossHealth'),
    }

    this.adjustResolution();
    this.attachController();

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

Game.prototype.handleInputEvent = function(event)
{
    if (this.scene === undefined) {
        console.error('No input receiver');
        return false;
    }
    this.scene.input.triggerEvent(event);
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

    this.engine.pause();

    if (this.scene) {
        this.scene.__destroy();
        this.scene = undefined;
        this.engine.unsetWorld();
    }

    this.scene = scene;
    this.scene.__create();
    this.engine.setWorld(this.scene.world);

    /* Because the camera is instantiated per scene,
       we make sure the aspect ratio is correct before
       we roll. */
    this.adjustAspectRatio();

    this.engine.run();
    this.scene.__start();
}
