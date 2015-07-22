var Engine = function(renderer)
{
    this.renderer = renderer;
    this.events = {
        'render': [],
        'simulate': [],
    };
    this.isRunning = false;
    this.isSimulating = true;
    this.simulationSpeed = 1;
    this.timeElapsedTotal = 0;
    this.timeMax = 1/60;
    this.timeStretch = 1;
    this.scene = undefined;
}

Engine.prototype.loop = function(timeElapsed)
{
    if (!this.isRunning || !this.scene) {
        return false;
    }

    if (timeElapsed) {
        var i = 0;
        timeElapsed /= 1000;
        if (this.timeLastEvent) {
            var timeDiff = timeElapsed - this.timeLastEvent;
            timeDiff *= this.timeStretch;

            /* Never let more time than 1/60th of a second pass per frame in game world. */
            timeDiff = Math.min(timeDiff, this.timeMax);
            this.timeElapsedTotal += timeDiff;

            if (this.isSimulating && this.simulationSpeed) {
                var simTimeDiff = timeDiff * this.simulationSpeed;
                this.scene.updateTime(simTimeDiff);
                this.scene.camera.updateTime(simTimeDiff);

                for (i in this.events.simulate) {
                    this.events.simulate[i].call();
                }
            }
        }
        this.render();
        for (i in this.events.render) {
            this.events.render[i].call();
        }
        this.timeLastEvent = timeElapsed;
    }

    requestAnimationFrame(this.loop.bind(this));
}

Engine.prototype.pause = function()
{
    this.isRunning = false;
}

Engine.prototype.render = function()
{
    this.renderer.render(this.scene.scene,
                         this.scene.camera.camera);
}

Engine.prototype.run = function()
{
    if (this.isRunning) {
        throw new Error('Already running');
    }
    this.isRunning = true;
    this.timeLastEvent = undefined;
    this.loop();
}

Math.RAD = Math.PI/180;

Engine.assets = {};
