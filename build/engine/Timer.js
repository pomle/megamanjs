var Timer = function()
{
    var self = this;
    self.running = false;
    self.animationCycleId = undefined;
    self.callbacks = [];
    self.timeLastEvent = undefined;

    self.eventLoop = function()
    {
        var timeNow = new Date();
        var timeElapsed = (timeNow.getTime() - self.timeLastEvent.getTime()) / 1000;
        self.timeLastEvent = timeNow;

        if (!self.running) {
            return;
        }

        var i;
        if (self.callbacks.length) {
            for (i in self.callbacks) {
                self.callbacks[i](timeElapsed);
            }
        }

        self.animationCycleId = requestAnimationFrame(self.eventLoop);
    }

    self.start = function()
    {
        if (self.running) {
            return true;
        }

        self.timeLastEvent = new Date();
        self.running = true;
        self.eventLoop();

        return true;
    }

    self.stop = function()
    {
        if (!self.running) {
            return true;
        }

        self.running = false;
        if (self.animationCycleId) {
            cancelAnimationFrame(self.animationCycleId);
            self.animationCycleId = undefined;
        }

        return true;
    }
}
