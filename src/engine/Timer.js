'use strict';

Engine.Timer = class Timer
{
    constructor()
    {
        this.EVENT_RENDER = 'render';
        this.EVENT_UPDATE = 'update';
        this.EVENT_SIMULATE = 'simulate';
        this.EVENT_TIMEPASS = 'timepass';

        this.accumulator = 0;
        this.events = new Engine.Events(this);
        this.frameId = undefined;
        this.isRunning = false;
        this.isSimulating = true;
        this.simulationSpeed = 1;
        this.simulationTimePassed = 0;
        this.realTimePassed = 0;
        this.timeStep = 1/120;

        this.eventLoop = this.eventLoop.bind(this);
    }
    doFor(seconds, callback)
    {
        var elapsed = 0;
        const wrapper = (dt) => {
            callback(elapsed);
            elapsed += dt;
        };
        this.events.bind(this.EVENT_SIMULATE, wrapper);
        return this.waitFor(seconds).then(() => {
            this.events.unbind(this.EVENT_SIMULATE, wrapper);
        });
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
    simulateTime(dt)
    {
        this.events.trigger(this.EVENT_SIMULATE, [dt]);
        this.simulationTimePassed += dt;
    }
    updateTime(dt)
    {

        if (this.isSimulating === true && this.simulationSpeed !== 0) {
            const step = this.timeStep;
            const passed = dt * this.simulationSpeed;
            this.accumulator += passed;
            while (this.accumulator >= step) {
                this.simulateTime(step);
                this.accumulator -= step;
            }
            this.events.trigger(this.EVENT_UPDATE, [passed]);
        }
        this.events.trigger(this.EVENT_TIMEPASS, [dt]);
        this.realTimePassed += dt;
    }
    waitFor(seconds)
    {
        var elapsed = 0;
        return new Promise(resolve => {
            const wait = (dt) => {
                elapsed += dt;
                if (elapsed >= seconds) {
                    this.events.unbind(this.EVENT_UPDATE, wait);
                    resolve();
                }
            };
            this.events.bind(this.EVENT_UPDATE, wait);
        });
    }
}
