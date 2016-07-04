'use strict';

Engine.Timer =
class Timer
{
    constructor()
    {
        this.EVENT_RENDER = 'render';
        this.EVENT_UPDATE = 'update';

        this.events = new Engine.Events(this);
        this.frameId = undefined;
        this.isRunning = false;

        this.eventLoop = this.eventLoop.bind(this);
    }
    enqueue()
    {
        this.frameId = requestAnimationFrame(this.eventLoop);
    }
    eventLoop(micros)
    {
        if (micros !== undefined) {
            const seconds = micros / 1000;
            if (this.timeLastEvent !== undefined) {
                this.updateTime(seconds - this.timeLastEvent);
            }
            this.timeLastEvent = seconds;
        }
        this.events.trigger(this.EVENT_RENDER);

        if (this.isRunning === true) {
            this.enqueue();
        }
    }
    pause()
    {
        cancelAnimationFrame(this.frameId);
        this.isRunning = false;
    }
    run()
    {
        if (this.isRunning) {
            return;
        }
        this.isRunning = true;
        this.timeLastEvent = undefined;
        this.enqueue();
    }
    updateTime(deltaTime)
    {
        this.events.trigger(this.EVENT_UPDATE, [deltaTime]);
    }
}
