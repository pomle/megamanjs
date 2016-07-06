'use strict';

Engine.Timer =
class Timer
{
    constructor()
    {
        this.EVENT_RENDER = 'render';
        this.EVENT_UPDATE = 'update';

        this._frameId = null;
        this._isRunning = false;
        this._timeLastEvent = null;
        this._timeStretch = 1;

        this.events = new Engine.Events(this);

        this.eventLoop = this.eventLoop.bind(this);
    }
    _enqueue()
    {
        this._frameId = requestAnimationFrame(this.eventLoop);
    }
    eventLoop(micros)
    {
        if (micros !== undefined) {
            const seconds = micros / 1000;
            if (this._timeLastEvent != null) {
                this.updateTime(seconds - this._timeLastEvent);
            }
            this._timeLastEvent = seconds;
        }
        this.events.trigger(this.EVENT_RENDER);

        if (this._isRunning === true) {
            this._enqueue();
        }
    }
    pause()
    {
        cancelAnimationFrame(this._frameId);
        this._isRunning = false;
    }
    run()
    {
        if (this._isRunning) {
            return;
        }
        this._isRunning = true;
        this._timeLastEvent = null;
        this._enqueue();
    }
    setTimeStretch(multiplier)
    {
        this._timeStretch = multiplier;
    }
    updateTime(deltaTime)
    {
        const adjustedDelta = deltaTime * this._timeStretch;
        this.events.trigger(this.EVENT_UPDATE, [adjustedDelta]);
    }
}
