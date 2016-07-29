'use strict';

Engine.InputRecorder =
class InputRecorder
{
    constructor(world, input)
    {
        this._world = world;
        this._input = input;
        this._log = [];
        this._lastTime = null;

        this._listener = (key, type) => {
            const time = this._getTime();
            this._log.push({
                time: time - this._lastTime,
                key: key,
                type: type,
            });
            this._lastTime = time;
        };
    }
    _getTime()
    {
        return this._world._timeTotal;
    }
    getLog()
    {
        return this._log;
    }
    record()
    {
        this._lastTime = this._getTime();
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
