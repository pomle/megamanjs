Engine.traits.Jump = function()
{
    Engine.Trait.call(this);

    this._inertia = 0;
    this._time = undefined;

    this.duration = .18;
    this.force = 180;
}

Engine.Util.extend(Engine.traits.Jump, Engine.Trait);

Engine.traits.Jump.prototype.__obstruct = function(object, attack)
{
    if (object.solid && attack === object.solid.BOTTOM) {
        this.end();
    }
}

Engine.traits.Jump.prototype.__timeshift = function(deltaTime)
{
    if (this._inertia) {
        this._host.physics.inertia.y = this._inertia;
        if (this._host.time - this._time > this.duration) {
            this.end();
        }
    }
}

Engine.traits.Jump.prototype.start = function()
{
    if (this._host.stunnedTime > 0) {
        return false;
    }

    if (!this._host.isSupported) {
        return false;
    }
    this._host.isSupported = false;
    this._inertia = this._host.physics.inertia.y + this.force;
    this._time = this._host.time;
}

Engine.traits.Jump.prototype.end = function()
{
    this._inertia = 0;
}
