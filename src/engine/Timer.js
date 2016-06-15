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

        this.doFor = Engine.Loops.doFor(this.events, this.EVENT_SIMULATE);
        this.waitFor = Engine.Loops.waitFor(this.events, this.EVENT_UPDATE);

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
}
