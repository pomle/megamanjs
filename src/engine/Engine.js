var Engine = function(renderer)
{
    this.events = new Engine.Events();
    this.renderer = renderer;
    this.isRunning = false;
    this.isSimulating = true;
    this.simulationSpeed = 1;
    this.speedLimit = 1;
    this.tick = 0;
    this.timeElapsedTotal = 0;
    this.timeMax = 1/60;
    this.timeStretch = 1;
    this.world = undefined;

    this.loop = this.loop.bind(this);
}

Engine.prototype.EVENT_RENDER = 'render';
Engine.prototype.EVENT_SIMULATE = 'simulate';
Engine.prototype.EVENT_TIMEPASS = 'timepass';

Engine.logic = {};
Engine.traits = {};

Engine.prototype.loop = function(timeElapsed)
{
    if (!this.isRunning || this.world === undefined) {
        return false;
    }

    this.tick += this.speedLimit;
    if (this.tick >= 1 && timeElapsed !== 0) {
        timeElapsed /= 1000;
        if (this.timeLastEvent !== undefined) {
            var timeDiff = timeElapsed - this.timeLastEvent;
            timeDiff *= this.timeStretch;

            /* Never let more time than 1/60th of a second pass per frame in game world. */
            timeDiff = Math.min(timeDiff, this.timeMax);
            this.timeElapsedTotal += timeDiff;

            if (this.isSimulating && this.simulationSpeed) {
                var simTimeDiff = timeDiff * this.simulationSpeed;
                this.world.updateTime(simTimeDiff);
                this.world.camera.updateTime(simTimeDiff);

                this.events.trigger(this.EVENT_SIMULATE, [simTimeDiff]);
            }
            this.events.trigger(this.EVENT_TIMEPASS, [timeDiff]);
        }
        this.render();
        this.events.trigger(this.EVENT_RENDER);

        this.tick = 0;
        this.timeLastEvent = timeElapsed;
    }

    requestAnimationFrame(this.loop);
}

Engine.prototype.pause = function()
{
    this.isRunning = false;
}

Engine.prototype.render = function()
{
    this.renderer.render(this.world.scene,
                         this.world.camera.camera);
}

Engine.prototype.run = function()
{
    if (this.isRunning) {
        return;
    }
    this.isRunning = true;
    this.timeLastEvent = undefined;
    this.loop(0);
}

Engine.prototype.setWorld = function(world)
{
    if (world instanceof Engine.World === false) {
        throw new TypeError('Invalid world');
    }
    this.world = world;
}

Engine.prototype.unsetWorld = function()
{
    this.world = undefined;
}
