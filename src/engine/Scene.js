const AudioManager = require('./AudioManager');
const Camera = require('./Camera');
const Events = require('./Events');
const Keyboard = require('./Keyboard');
const Loops = require('./Loops');
const SequenceManager = require('./SequenceManager');
const Timer = require('./Timer');
const World = require('./World');

class Scene
{
    constructor()
    {
        this.EVENT_CREATE = 'create';
        this.EVENT_DESTROY = 'destroy';
        this.EVENT_END = 'end';
        this.EVENT_START = 'start';
        this.EVENT_PAUSE = 'pause';
        this.EVENT_RESUME = 'resume';

        this.EVENT_INPUT = 'input';

        this.audio = new AudioManager();
        this.sequencer = new SequenceManager(this);
        this.camera = new Camera;
        this.game = null;
        this.events = new Events(this);
        this.input = new Keyboard;
        this.timer = new Timer;
        this.world = new World;

        this.doFor = Loops.doFor(this.world.events, this.world.EVENT_SIMULATE);
        this.waitFor = Loops.waitFor(this.world.events, this.world.EVENT_SIMULATE);

        this.input.events.bind(this.input.EVENT_TRIGGER, (key, type) => {
            this.events.trigger(this.EVENT_INPUT, [key, type]);
        });

        this._inputRoute = (key, state) => {
            this.input.trigger(key, state);
        };

        this._timerBound = false;
        this._timerUpdate = (dt) => {
            this.world.updateTime(dt);
            this.camera.updateTime(dt);
        };

        const render = this.render = () => {
            this.game.renderer.render(this.world.scene,
                                      this.camera.camera);
        };

        const audioListener = (audio) => {
            this.game.audioPlayer.play(audio);
        };

        this.events.bind(this.EVENT_CREATE, (game) => {
            this.__create(game);
            this.timer.events.bind(this.timer.EVENT_RENDER, render);
            this.world.events.bind(this.world.EVENT_EMIT_AUDIO, audioListener);
        });

        this.events.bind(this.EVENT_START, () => {
            this.__start();
        });

        this.events.bind(this.EVENT_RESUME, () => {
            this.__resume();
        });

        this.events.bind(this.EVENT_PAUSE, () => {
            this.__pause();
        });

        this.events.bind(this.EVENT_END, () => {
            this.__end();
        });

        this.events.bind(this.EVENT_DESTROY, () => {
            this.__destroy();
            this.timer.events.unbind(this.timer.EVENT_RENDER, render);
            this.world.events.unbind(this.world.EVENT_EMIT_AUDIO, audioListener);
        });
    }
    __create(game)
    {
        this.game = game;
        this.audio.setPlayer(game.audioPlayer);

        const input = this.game.input;
        input.events.bind(input.EVENT_TRIGGER, this._inputRoute);
    }
    __start()
    {
        this.startSimulation();
    }
    __resume()
    {
        this.timer.run();
    }
    __pause()
    {
        this.input.release();
        this.timer.pause();
    }
    __end()
    {
        this.__pause();
    }
    __destroy()
    {
        this.stopSimulation();
        this.audio.stopAll();
        this.audio.unsetPlayer();

        const input = this.game.input;
        input.events.unbind(input.EVENT_TRIGGER, this._inputRoute);

        this.game = null;
    }
    pauseSimulation()
    {
        this.stopSimulation();
    }
    resumeSimulation()
    {
        this.startSimulation();
    }
    startSimulation()
    {
        if (!this._timerBound) {
            const t = this.timer;
            t.events.bind(t.EVENT_UPDATE, this._timerUpdate);
            this._timerBound = true;
        }
    }
    stopSimulation()
    {
        if (this._timerBound) {
            const t = this.timer;
            t.events.unbind(t.EVENT_UPDATE, this._timerUpdate);
            this._timerBound = false;
        }
    }
}

module.exports = Scene;
