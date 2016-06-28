'use strict';

Game.Scene = class Scene
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

        this.audio = {};
        this.sequencer = new Engine.SequenceManager(this);
        this.camera = new Engine.Camera;
        this.game = null;
        this.events = new Engine.Events(this);
        this.input = new Engine.Keyboard;
        this.timer = new Engine.Timer;
        this.world = new Engine.World;

        this.doFor = Engine.Loops.doFor(this.timer.events, this.timer.EVENT_SIMULATE);
        this.waitFor = Engine.Loops.waitFor(this.timer.events, this.timer.EVENT_UPDATE);

        const timer = this.timer;
        const world = this.world;
        const scene = world.scene;
        const camera = this.camera.camera;

        this.input.events.bind(this.input.EVENT_TRIGGER, (key, type) => {
            this.events.trigger(this.EVENT_INPUT, [key, type]);
        });

        this.simulate = (dt) => {
            this.world.updateTime(dt);
        };

        const animate = (dt) => {
            world.updateAnimation(dt);
            this.camera.updateTime(dt);
        };

        const render = () => {
            this.game.renderer.render(scene, camera);
        };

        const audioListener = (audio) => {
            this.game.audioPlayer.play(audio);
        };

        this.events.bind(this.EVENT_CREATE, (game) => {
            this.__create(game);
            timer.events.bind(timer.EVENT_UPDATE, animate);
            timer.events.bind(timer.EVENT_RENDER, render);
            world.events.bind(world.EVENT_EMIT_AUDIO, audioListener);
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
            timer.events.unbind(timer.EVENT_UPDATE, animate);
            timer.events.unbind(timer.EVENT_RENDER, render);
            world.events.unbind(world.EVENT_EMIT_AUDIO, audioListener);
        });
    }
    __create(game)
    {
        this.game = game;
    }
    __start()
    {
        this.startSimulation();
    }
    __resume()
    {
        this.game.audioPlayer.resume();
        this.timer.run();
    }
    __pause()
    {
        this.game.audioPlayer.pause();
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
        this.game.audioPlayer.stop();
        this.game = null;
    }
    getAudio(id)
    {
        if (!this.audio[id]) {
            throw new Error(`Audio id '${id}' not defined`);
        }
        return this.audio[id];
    }
    playAudio(id)
    {
        const audio = this.getAudio(id);
        this.game.audioPlayer.play(audio);
    }
    stopAudio(id)
    {
        const audio = this.getAudio(id);
        this.game.audioPlayer.stop(audio);
    }
    pauseSimulation()
    {
        this.timer.isSimulating = false;
    }
    resumeSimulation()
    {
        this.timer.isSimulating = true;
    }
    startSimulation()
    {
        this.timer.events.bind(this.timer.EVENT_SIMULATE, this.simulate);
    }
    stopSimulation()
    {
        this.timer.events.unbind(this.timer.EVENT_SIMULATE, this.simulate);
    }
}
