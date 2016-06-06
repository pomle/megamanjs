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

        this.game = null;
        this.events = new Engine.Events(this);
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
    __create(game)
    {
        this.game = game;
        this.events.trigger(this.EVENT_CREATE, [game]);
    }
    __start(game)
    {
        console.trace('START');
        this.events.trigger(this.EVENT_START, [game]);
    }
    __resume(game)
    {
        game.audioPlayer.resume();
        this.timer.run();
        this.events.trigger(this.EVENT_RESUME, [game]);
    }
    __pause(game)
    {
        game.audioPlayer.pause();
        this.input.release();
        this.timer.pause();
        this.events.trigger(this.EVENT_PAUSE, [game]);
    }
    __end(game)
    {
        this.events.trigger(this.EVENT_END, [game]);
    }
    __destroy(game)
    {
        game.audioPlayer.stop();
        this.events.trigger(this.EVENT_DESTROY, [game]);
        this.game = null;
    }
}
