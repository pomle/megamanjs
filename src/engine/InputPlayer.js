'use strict';

Engine.InputPlayer =
class InputPlayer
{
    constructor(world, input)
    {
        this._world = world;
        this._input = input;
        this._abort = null;
    }
    play(log)
    {
        const world = this._world;
        const input = this._input;
        let i = 0;
        let next = null;
        return new Promise((resolve, reject) => {
            const onSimulate = (dt, t) => {
                if (t >= next) {
                    input.trigger(log[i].key, log[i].type);
                    if (log[++i]) {
                        next += log[i].time;
                    } else {
                        stop();
                        resolve();
                    }
                }
            };

            const stop = () => {
                world.events.unbind(world.EVENT_SIMULATE, onSimulate);
            };

            this._abort = (err) => {
                stop();
                reject(err);
            };

            next = world._timeTotal + log[i].time;
            world.events.bind(world.EVENT_SIMULATE, onSimulate);
        });
    }
    playJSON(json)
    {
        const log = JSON.parse(json);
        return this.play(log);
    }
    stop()
    {
        this._abort(new Error('Stopped'));
        this._abort = null;
    }
}
