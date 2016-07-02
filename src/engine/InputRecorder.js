'use strict';

Engine.InputRecorder =
class InputRecorder
{
    constructor(game, input)
    {
        this._game = game;
        this._input = input;
        this._log = [];
        this._lastTime = 0;
        this._recording = false;

        this._listener = (key, type) => {
            if (this._recording === true) {
                const time = this._game.scene.timer.simulationTimePassed;
                this._log.push({
                    time: time - this._lastTime,
                    key: key,
                    type: type,
                });
                this._lastTime = time;
            }
        };
    }
    listen()
    {
        const input = this._input;
        input.events.bind(input.EVENT_TRIGGER, this._listener);
    }
    unlisten()
    {
        const input = this._input;
        input.events.unbind(input.EVENT_TRIGGER, this._listener);
    }
    record()
    {
        this._lastTime = this._game.scene.timer.simulationTimePassed;
        this._recording = true;
    }
    stop()
    {
        this._recording = false;
    }
    toJson()
    {
        return JSON.stringify(this._log);
    }
}
