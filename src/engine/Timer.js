Engine.Timer = function()
{
    this.animationCycleId = undefined;
    this.callbacks = [];
    this.running = false;
    this.simulationTime = 1;
    this.timeLastEvent = undefined;
    this.timeMax = 1 / 60;
    this.timeStretch = 1;
}

Engine.Timer.prototype.eventLoop = function(timeElapsed)
{
    if (!this.running) {
        return;
    }

    timeElapsed /= 1000;

    if (this.timeLastEvent && this.callbacks.length) {
        var timeDiff = timeElapsed - this.timeLastEvent;
        timeDiff *= this.timeStretch;

        /* Never let more time than 1/60th of a second pass per frame in game world. */
        timeDiff = Math.min(timeDiff, this.timeMax);

        if (this.simulationTime) {
            var simTimeDiff = timeDiff * this.simulationTime;
            for (var i in this.callbacks) {
                this.callbacks[i](simTimeDiff);
            }
        }
    }

    this.timeLastEvent = timeElapsed;

    requestAnimationFrame(this.eventLoop.bind(this));
}

Engine.Timer.prototype.start = function()
{
    if (this.running) {
        return true;
    }

    this.timeLastEvent = undefined;
    this.running = true;
    this.eventLoop();

    return true;
}

Engine.Timer.prototype.stop = function()
{
    if (!this.running) {
        return true;
    }

    this.running = false;
    if (this.animationCycleId) {
        cancelAnimationFrame(this.animationCycleId);
        this.animationCycleId = undefined;
    }

    return true;
}
