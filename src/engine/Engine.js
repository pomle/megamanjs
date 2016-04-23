var Engine = function(renderer) {
    this.accumulator = 0;
    this.events = new Engine.Events();
    this.frameId = undefined;
    this.renderer = renderer;
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

Engine.prototype.EVENT_RENDER = 'render';
Engine.prototype.EVENT_SIMULATE = 'simulate';
Engine.prototype.EVENT_TIMEPASS = 'timepass';

Engine.logic = {};

Engine.prototype.eventLoop = function(timeElapsed) {
    if (timeElapsed !== undefined) {
        // Convert to seconds.
        timeElapsed /= 1000;

        if (this.timeLastEvent !== undefined) {
            this.updateTime(timeElapsed - this.timeLastEvent);
        }
        this.timeLastEvent = timeElapsed;
    }

    this.render();
    this.events.trigger(this.EVENT_RENDER);

    if (this.isRunning === true) {
        this.frameId = requestAnimationFrame(this.eventLoop);
    }
}

Engine.prototype.pause = function() {
    cancelAnimationFrame(this.frameId);
    this.isRunning = false;
}

Engine.prototype.render = function() {
    this.renderer.render(this.world.scene,
                         this.world.camera.camera);
}

Engine.prototype.run = function() {
    if (this.isRunning === true) {
        throw new Error('Already running');
    }
    this.isRunning = true;
    this.timeLastEvent = undefined;
    this.eventLoop();
}

Engine.prototype.simulateTime = function(dt) {
    this.world.updateTime(dt);
    this.world.camera.updateTime(dt);
    this.events.trigger(this.EVENT_SIMULATE, [dt]);
    this.simulationTimePassed += dt;
}

Engine.prototype.updateAnimation = function(dt) {
    this.world.updateAnimation(dt);
}

Engine.prototype.updateTime = function(dt) {
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

Engine.prototype.setWorld = function(world) {
    if (world instanceof Engine.World === false) {
        throw new TypeError('Invalid world');
    }
    this.world = world;
}

Engine.prototype.unsetWorld = function() {
    this.world = undefined;
}
