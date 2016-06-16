const Game = class Game
{
    constructor()
    {
        this.EVENT_SCENE_CREATE = 'scene_create';
        this.EVENT_SCENE_DESTROY = 'scene_destroy';

        this._playbackSpeed = 1;

        this.events = new Engine.Events(this);
        this.audioPlayer = new Engine.AudioPlayer();
        this.renderer = new THREE.WebGLRenderer({
            'antialias': false,
        });

        this.player = new Game.Player();

        this.handleInputEvent = this.handleInputEvent.bind(this);
    }
    attachController(element)
    {
        element.addEventListener('keydown', this.handleInputEvent);
        element.addEventListener('keyup', this.handleInputEvent);
    }
    attachToElement(element)
    {
        this.element = element;
        this.adjustResolution();
        this.element.appendChild(this.renderer.domElement);
    }
    adjustAspectRatio()
    {
        if (this.scene && this.element) {
            var rect = this.element.getBoundingClientRect();
            var cam = this.scene.camera.camera;
            cam.aspect = rect.width / rect.height;
            cam.updateProjectionMatrix();
        }
    }
    adjustResolution()
    {
        const rect = this.element.getBoundingClientRect();
        this.setResolution(rect.width, rect.height);
    }
    handleInputEvent(event)
    {
        if (this.scene === undefined) {
            console.error('No input receiver');
            return false;
        }
        this.scene.input.triggerEvent(event);
    }
    pause()
    {
        if (this.scene) {
            this.scene.__pause(this);
        }
    }
    resume()
    {
        if (this.scene) {
            this.scene.__resume(this);
        }
    }
    setPlaybackSpeed(rate)
    {
        this._playbackSpeed = rate;
        this._updatePlaybackSpeed();
    }
    _updatePlaybackSpeed()
    {
        this.scene.timer.simulationSpeed = this._playbackSpeed;
        this.audioPlayer.setPlaybackRate(this._playbackSpeed);
    }
    setResolution(w, h)
    {
        this.renderer.setSize(w, h);
        this.renderer.domElement.removeAttribute("style");
    }
    setScene(scene)
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
        this._updatePlaybackSpeed();

        this.scene.events.trigger(this.scene.EVENT_START);
        this.scene.events.trigger(this.scene.EVENT_RESUME);
    }
    unsetScene()
    {
        if (this.scene) {
            this.events.trigger(this.EVENT_SCENE_DESTROY, [this.scene]);
            this.scene.events.trigger(this.scene.EVENT_DESTROY);
            this.scene = undefined;
        }
    }
}

Game.objects = {};
Game.scenes = {};
Game.traits = {};
