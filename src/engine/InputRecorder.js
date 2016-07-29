'use strict';

Engine.InputRecorder =
class InputRecorder
{
    constructor(world, input)
    {
        this._world = world;
        this._input = input;
        this._log = [];

        this._listener = (key, type) => {
            this._log.push({
                tick: this._world._tick,
                key: key,
                type: type,
            });
        };
    }
    getLog()
    {
        return this._log;
    }
    record()
    {
        const input = this._input;
        input.events.bind(input.EVENT_TRIGGER, this._listener);
    }
    stop()
    {
        const input = this._input;
        input.events.unbind(input.EVENT_TRIGGER, this._listener);
    }
    toJSON()
    {
        return JSON.stringify(this._log);
    }
}
