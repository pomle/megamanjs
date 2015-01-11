Engine.Timer = function()
{
    this.animationCycleId = undefined;
    this.callbacks = [];
    this.running = false;
    this.timeLastEvent = undefined;
    this.timeStretch = 1;
}

Engine.Timer.prototype.eventLoop = function()
{
    var timeNow = new Date();
    var timeElapsed = (timeNow.getTime() - this.timeLastEvent.getTime()) / 1000;
    this.timeLastEvent = timeNow;

    if (!this.running) {
        return;
    }

    timeElapsed *= this.timeStretch;

    var i;
    if (this.callbacks.length) {
        for (i in this.callbacks) {
            this.callbacks[i](timeElapsed);
        }
    }

    requestAnimationFrame(this.eventLoop.bind(this));
}

Engine.Timer.prototype.start = function()
{
    if (this.running) {
        return true;
    }

    this.timeLastEvent = new Date();
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
