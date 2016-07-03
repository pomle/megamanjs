'use strict';

Engine.InputPlayer =
class InputPlayer
{
    constructor(game, input)
    {
        this._game = game;
        this._input = input;
        this._nextTime = null;
        this._resume = null;
        this._stop = null;

        const timer = this._game.scene.timer;
        this._watcher = (dt) => {
            if (timer.simulationTimePassed >= this._nextTime) {
                console.log("%f reached", this._nextTime);
                engine.pause();
                this._resume();
            }
        };
    }
    _waitFor(dt)
    {
        this._nextTime += dt;
        return new Promise((resolve, reject) => {
            this._resume = resolve;
            this._stop = reject;
            this._game.scene.timer.run();
        });
    }
    play(log)
    {
        const timer = this._game.scene.timer;
        timer.events.bind(engine.EVENT_TIMEPASS, this._watcher);
        timer.pause();

        this._nextTime = timer.simulationTimePassed;
        let chain = this._waitFor(log[0].time);
        let i = 0;
        for (let j = 0; j < log.length - 1; ++j) {
            chain = chain.then(() => {
              this._input.trigger(log[i].key, log[i].type);
              return this._waitFor(log[++i].time);
            });
        }
        chain.then(() => {
            timer.events.unbind(engine.EVENT_TIMEPASS, this._watcher);
        });
    }
    stop()
    {
        this._input.release();
        this._stop(new Error('Stopped'));
        this._stop = null;
    }
}
