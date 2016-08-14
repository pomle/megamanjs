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
        this._cancelAnimationFrame = cancelAnimationFrame.bind(window);
        this._requestAnimationFrame = requestAnimationFrame.bind(window);
        this._timeLastEvent = null;
        this._timeStretch = 1;

        this.events = new Engine.Events(this);

        this.eventLoop = this.eventLoop.bind(this);
    }
    _enqueue()
    {
        this._frameId = this._requestAnimationFrame(this.eventLoop);
    }
    eventLoop(millis)
    {
        if (millis !== undefined) {
            const diff = millis - this._timeLastEvent;
            this.updateTime(diff / 1000);
            this._timeLastEvent = millis;
        }
        this.events.trigger(this.EVENT_RENDER);

        if (this._isRunning === true) {
            this._enqueue();
        }
    }
    pause()
    {
        this._cancelAnimationFrame(this._frameId);
        this._isRunning = false;
    }
    run()
    {
        if (this._isRunning) {
            return;
        }
        this._isRunning = true;
        this._timeLastEvent = performance.now();
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
