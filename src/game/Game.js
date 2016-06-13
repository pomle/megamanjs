var Game = function()
{
    this.events = new Engine.Events(this);
    this.audioPlayer = new Engine.AudioPlayer();
    this.renderer = new THREE.WebGLRenderer({
        'antialias': false,
    });

    this.player = new Game.Player();
    this.player.hud = new Hud(this);
}

Game.prototype.EVENT_SCENE_CREATE = 'scene_create';
Game.prototype.EVENT_SCENE_DESTROY = 'scene_destroy';

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

    this.element.appendChild(this.renderer.domElement);
}

Game.prototype.adjustAspectRatio = function()
{
    if (this.scene && this.element) {
        var rect = this.element.getBoundingClientRect();
        var cam = this.scene.camera.camera;
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

Game.prototype.pause = function()
{
    if (this.scene) {
        this.scene.__pause(this);
    }
}

Game.prototype.resume = function()
{
    if (this.scene) {
        this.scene.__resume(this);
    }
}

Game.prototype.setResolution = function(w, h)
{
    this.renderer.setSize(w, h);
    this.renderer.domElement.removeAttribute("style");
}

Game.prototype.setScene = function(scene)
{
    if (scene instanceof Game.Scene === false) {
        throw new Error('Invalid scene');
    }

    this.unsetScene();

    this.scene = scene;
    this.scene.events.trigger(this.scene.EVENT_CREATE, [this]);
    this.events.trigger(this.EVENT_SCENE_CREATE, [this.scene]);


    /* Because the camera is instantiated per scene,
       we make sure the aspect ratio is correct before
       we roll. */
    this.adjustAspectRatio();

    this.scene.events.trigger(this.scene.EVENT_START);
    this.scene.events.trigger(this.scene.EVENT_RESUME);
}

Game.prototype.unsetScene = function()
{
    if (this.scene) {
        this.scene.events.trigger(this.scene.EVENT_DESTROY);
        this.events.trigger(this.EVENT_SCENE_DESTROY, [this.scene]);
        this.scene = undefined;
    }
}
