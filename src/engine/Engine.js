'use strict';

class Engine {
    constructor()
    {
        this.EVENT_RENDER = 'render';
        this.EVENT_SIMULATE = 'simulate';
        this.EVENT_TIMEPASS = 'timepass';

        this.accumulator = 0;
        this.events = new Engine.Events();
        this.frameId = undefined;
        this.isRunning = false;
        this.isSimulating = true;
        this.simulationSpeed = 1;
        this.simulationTimePassed = 0;
        this.realTimePassed = 0;
        this.timeStep = 1/120;
        this.timeStretch = 1;
        this.world = undefined;

        this.eventLoop = this.eventLoop.bind(this);
    }
    eventLoop(timeElapsed)
    {
        if (timeElapsed !== undefined) {
            // Convert to seconds.
            timeElapsed /= 1000;

            if (this.timeLastEvent !== undefined) {
                this.updateTime(timeElapsed - this.timeLastEvent);
            }
            this.timeLastEvent = timeElapsed;
        }

        this.events.trigger(this.EVENT_RENDER);

        if (this.isRunning === true) {
            this.frameId = requestAnimationFrame(this.eventLoop);
        }
    }
    pause()
    {
        cancelAnimationFrame(this.frameId);
        this.isRunning = false;
    }
    run()
    {
        if (this.isRunning === true) {
            throw new Error('Already running');
        }
        this.isRunning = true;
        this.timeLastEvent = undefined;
        this.eventLoop();
    }
    simulateTime(dt)
    {
        this.world.updateTime(dt);
        this.world.camera.updateTime(dt);
        this.events.trigger(this.EVENT_SIMULATE, [dt]);
        this.simulationTimePassed += dt;
    }
    updateAnimation(dt)
    {
        this.world.updateAnimation(dt);
    }
    updateTime(dt)
    {
        dt *= this.timeStretch;
        if (this.isSimulating === true && this.simulationSpeed !== 0) {
            this.accumulator += dt * this.simulationSpeed;
            while (this.accumulator >= this.timeStep) {
                this.simulateTime(this.timeStep);
                this.accumulator -= this.timeStep;
            }
            this.updateAnimation(dt);
        }
        this.events.trigger(this.EVENT_TIMEPASS, [dt]);
        this.realTimePassed += dt;
    }
    setWorld(world)
    {
        if (world instanceof Engine.World === false) {
            throw new TypeError('Invalid world');
        }
        this.world = world;
    }
    unsetWorld()
    {
        this.world = undefined;
    }
}

Engine.logic = {};
