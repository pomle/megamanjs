Engine.traits.Jump = function()
{
    Engine.Trait.call(this);

    this._inertia = 0;
    this._time = undefined;

    this.duration = .18;
    this.force = 180;
}

Engine.traits.Jump.prototype = Object.create(Engine.Trait.prototype);
Engine.traits.Jump.constructor = Engine.Trait;

Engine.traits.Jump.prototype.NAME = 'jump';

Engine.traits.Jump.prototype.__obstruct = function(object, attack)
{
    if (object.solid && attack === object.solid.BOTTOM) {
        this.end();
    }
}

Engine.traits.Jump.prototype.__timeshift = function(deltaTime)
{
    if (this._inertia) {
        this.object.physics.inertia.y = this._inertia;
        if (this.object.time - this._time > this.duration) {
            this.end();
        }
    }
}

Engine.traits.Jump.prototype.start = function()
{
    if (this.object.stunnedTime > 0) {
        return false;
    }

    if (!this.object.isSupported) {
        return false;
    }
    this.object.isSupported = false;
    this._inertia = this.object.physics.inertia.y + this.force;
    this._time = this.object.time;
}

Engine.traits.Jump.prototype.end = function()
{
    this._inertia = 0;
}
