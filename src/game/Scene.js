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

        this.audio = {};
        this.sequences = {};
        this.camera = new Engine.Camera;
        this.game = null;
        this.events = new Engine.Events(this);
        this.timer = new Engine.Timer;
        this.input = new Engine.Keyboard;
        this.world = new Engine.World;

        const timer = this.timer;
        const world = this.world;
        const scene = world.scene;
        const camera = this.camera.camera;

        this.simulate = (dt) => {
            this.world.updateTime(dt);
            this.camera.updateTime(dt);
        };

        const animate = (dt) => {
            world.updateAnimation(dt);
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
        this.game.audioPlayer.stop();
    }
    __destroy()
    {
        this.stopSimulation();
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
    getSequence(id)
    {
        if (!this.sequences[id]) {
            throw new Error(`Sequence id '${id}' not defined`);
        }
        return this.sequences[id];
    }
    playSequence(id)
    {
        const sequence = this.getSequence(id);
        const steps = [];

        let chain;
        const next = () => {
            if (steps.length) {
                const tasks = [];
                steps.shift().forEach(action => {
                    tasks.push(action.call(this));
                });
                return Promise.all(tasks).then(() => {
                    return next();
                });
            }
        };

        sequence.forEach(step => {
            const actions = [];
            step.forEach(action => {
                actions.push(action);
            });
            steps.push(actions);
        });

        return next();
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
