var Engine = function(renderer)
{
    this.events = new Engine.Events();

    this.timeElapsedTotal = 0;
    this.timeMax = 1/60;
    this.timeStretch = 1;

    this.renderer = renderer;
    this.renderTimer = undefined;

    this.simulationBusy = false;
    this.simulationResolution = 1/120;
    this.simulationRounds = 0;
    this.simulationSpeed = 1;
    this.simulationTime = undefined;
    this.simulationTimer = undefined;

    this.world = undefined;

    this.render = this.render.bind(this);
    this.simulate = this.simulate.bind(this);
}

Engine.prototype.EVENT_RENDER = 'render';
Engine.prototype.EVENT_SIMULATE = 'simulate';
Engine.prototype.EVENT_TIMEPASS = 'timepass';

Engine.logic = {};
Engine.traits = {};

Engine.prototype.pause = function()
{
    if (this.renderTimer !== undefined) {
        cancelAnimationFrame(this.renderTimer);
        this.renderTimer = undefined;
    }
    if (this.simulationTimer !== undefined) {
        clearInterval(this.simulationTimer);
        this.simulationTimer = undefined;
        this.simulationTime = undefined;
    }
}

Engine.prototype.render = function()
{
    this.renderTimer = requestAnimationFrame(this.render);
    this.renderer.render(this.world.scene, this.world.camera.camera);
    this.events.trigger(this.EVENT_RENDER);
}

Engine.prototype.run = function()
{
    if (this.world === undefined) {
        throw new Error('World not set');
    }

    if (this.simulationTimer === undefined) {
        if (this.simulationTime === undefined) {
            this.simulationTime = performance.now();
        }
        clearInterval(this.simulationTimer);
        var interval = this.simulationResolution * 1000;
        this.simulationTimer = setInterval(this.simulate, interval);
        console.log('Starting engine with time resolution %dms', interval);
    }
    this.render();
}

Engine.prototype.simulate = function()
{
    if (this.simulationBusy === true) {
        return;
    }
    this.simulationBusy = true;

    var deltaTime = performance.now() - this.simulationTime,
        deltaTimeWorld = (deltaTime / 1000) * this.simulationSpeed;

    this.world.updateTime(deltaTimeWorld);
    this.world.camera.updateTime(deltaTimeWorld);

    this.events.trigger(this.EVENT_SIMULATE, [deltaTimeWorld]);
    this.events.trigger(this.EVENT_TIMEPASS, [deltaTimeWorld]);

    this.simulationTime += deltaTime;

    this.simulationBusy = false;
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
