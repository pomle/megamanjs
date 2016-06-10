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
        this.game = null;
        this.events = new Engine.Events(this);
        this.timer = new Engine.Timer;
        this.input = new Engine.Keyboard;
        this.world = new Engine.World;

        const timer = this.timer;
        const world = this.world;
        const scene = world.scene;
        const camera = world.camera.camera;

        this.simulate = (dt) => {
            this.world.updateTime(dt);
            this.world.camera.updateTime(dt);
        };

        const animate = (dt) => {
            world.updateAnimation(dt);
        };

        const render = () => {
            if (this.game) {
                this.game.renderer.render(scene, camera);
            }
        };

        const audioListener = (audio) => {
            if (this.game) {
                this.game.audioPlayer.play(audio);
            }
        };

        this.events.bind(this.EVENT_CREATE, (game) => {
            this.startSimulation();
            timer.events.bind(timer.EVENT_UPDATE, animate);
            timer.events.bind(timer.EVENT_RENDER, render);
            world.events.bind(world.EVENT_EMIT_AUDIO, audioListener);
        });

        this.events.bind(this.EVENT_DESTROY, () => {
            this.stopSimulation();
            timer.events.unbind(timer.EVENT_UPDATE, animate);
            timer.events.unbind(timer.EVENT_RENDER, render);
            world.events.unbind(world.EVENT_EMIT_AUDIO, audioListener);
        });
    }
    __create(game)
    {
        this.game = game;
        this.events.trigger(this.EVENT_CREATE, [game]);
    }
    __start()
    {
        this.events.trigger(this.EVENT_START);
    }
    __resume()
    {
        this.game.audioPlayer.resume();
        this.timer.run();
        this.events.trigger(this.EVENT_RESUME);
    }
    __pause()
    {
        this.game.audioPlayer.pause();
        this.input.release();
        this.timer.pause();
        this.events.trigger(this.EVENT_PAUSE);
    }
    __end()
    {
        this.__pause();
        this.game.audioPlayer.stop();
        this.events.trigger(this.EVENT_END);
    }
    __destroy()
    {
        this.events.trigger(this.EVENT_DESTROY);
        this.game = null;
    }
    doFor(seconds, callback)
    {
        var elapsed = 0;
        const wrapper = (dt) => {
            callback(elapsed);
            elapsed += dt;
        };
        const timer = this.timer;
        this.timer.events.bind(this.timer.EVENT_TIMEPASS, wrapper);
        return this.waitFor(seconds).then(() => {
            this.timer.events.unbind(this.timer.EVENT_TIMEPASS, wrapper);
        });
    }
    getAudio(id)
    {
        if (!this.audio[id]) {
            throw new Error('Audio id ' + id + ' not found');
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
    startSimulation()
    {
        this.timer.events.bind(this.timer.EVENT_SIMULATE, this.simulate);
    }
    stopSimulation()
    {
        this.timer.events.unbind(this.timer.EVENT_SIMULATE, this.simulate);
    }
    waitFor(seconds)
    {
        const timer = this.timer;
        var elapsed = 0;
        return new Promise(resolve => {
            const wait = (dt) => {
                if (elapsed >= seconds) {
                    timer.events.unbind(timer.EVENT_UPDATE, wait);
                    resolve();
                } else {
                    elapsed += dt;
                }
            };
            timer.events.bind(timer.EVENT_UPDATE, wait);
        });
    }
}
