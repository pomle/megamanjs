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

        this.audioPlayer = new Engine.AudioPlayer();
        this.events = new Engine.Events();
        this.timer = new Engine.Timer();
        this.input = new Engine.Keyboard();
        this.world = new Engine.World();
        this.music = null;

        this.events.bind(this.EVENT_CREATE, (game) => {
            const timer = this.timer;
            const scene = this.world.scene;
            const camera = this.world.camera.camera;
            timer.events.bind(timer.EVENT_SIMULATE, dt => {
                this.world.updateTime(dt);
                this.world.camera.updateTime(dt);
            });
            timer.events.bind(timer.EVENT_UPDATE, (dt) => {
                this.world.updateAnimation(dt);
            });
            timer.events.bind(timer.EVENT_RENDER, () => {
                game.renderer.render(scene, camera);
            });
        });
    }
    __create()
    {
        this.events.trigger(this.EVENT_CREATE, arguments);
    }
    __start()
    {
        if (this.music) {
            this.audioPlayer.play(this.music);
        }
        this.events.trigger(this.EVENT_START, arguments);
    }
    __resume()
    {
        this.audioPlayer.resume();
        this.timer.run();
        this.events.trigger(this.EVENT_RESUME, arguments);
    }
    __pause()
    {
        this.input.release();
        this.audioPlayer.pause();
        this.timer.pause();
        this.events.trigger(this.EVENT_PAUSE, arguments);
    }
    __end()
    {
        this.events.trigger(this.EVENT_END, arguments);

    }
    __destroy()
    {
        this.audioPlayer.stop();
        this.events.trigger(this.EVENT_DESTROY, arguments);
    }
}
