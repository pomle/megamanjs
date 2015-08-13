Engine.traits.Jump = function()
{
    Engine.Trait.call(this);

    this._inertia = 0;
    this._time = undefined;

    this.duration = .18;
    this.force = 180;
}

Engine.Util.extend(Engine.traits.Jump, Engine.Trait);

Engine.traits.Jump.prototype.NAME = 'jump';

Engine.traits.Jump.prototype.__obstruct = function(object, attack)
{
    if (object.solid) {
        switch (attack) {
            case object.solid.TOP:
                this._host.isSupported = true;
                break;

            case object.solid.BOTTOM:
                this.end();
                break;
        }
    }
}

Engine.traits.Jump.prototype.__timeshift = function(deltaTime)
{
    if (this._inertia) {
        var host = this._host;
        host.physics.inertia.y = this._inertia;
        if (host.time - this._time > this.duration) {
            this.end();
        }
    }
}

Engine.traits.Jump.prototype.start = function()
{
    var host = this._host;
    if (host.stunnedTime > 0) {
        return false;
    }

    host.isClimbing = false;
    if (!host.isSupported) {
        return false;
    }
    host.isSupported = false;
    this._inertia = host.physics.inertia.y + this.force;
    this._time = host.time;
}

Engine.traits.Jump.prototype.end = function()
{
    this._inertia = 0;
}
