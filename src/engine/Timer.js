Engine.Timer = function()
{
    this.animationCycleId = undefined;
    this.callbacks = [];
    this.frame = 0;
    this.frameRateLimit = 1;
    this.running = false;
    this.timeLastEvent = undefined;
    this.timeStretch = 1;
}

Engine.Timer.prototype.eventLoop = function(timeElapsed)
{
    if (!this.running) {
        return;
    }

    if (this.frame++ % this.frameRateLimit == 0) {
        timeElapsed /= 1000;

        if (this.timeLastEvent && this.callbacks.length) {

            var timeDiff = timeElapsed - this.timeLastEvent;
            timeDiff *= this.timeStretch;

            for (var i in this.callbacks) {
                this.callbacks[i](timeDiff);
            }
        }

        this.timeLastEvent = timeElapsed;
    }

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
