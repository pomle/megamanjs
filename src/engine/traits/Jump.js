Engine.traits.Jump = function()
{
    Engine.Trait.call(this);

    this._elapsed = undefined;

    this.duration = .18;
    this.force = 20;
}

Engine.Util.extend(Engine.traits.Jump, Engine.Trait);

Engine.traits.Jump.prototype.NAME = 'jump';

Engine.traits.Jump.prototype.__obstruct = function(object, attack)
{
    switch (attack) {
        case object.SURFACE_TOP:
            this._host.isSupported = true;
            break;

        case object.SURFACE_BOTTOM:
            this.end();
            break;
    }
}

Engine.traits.Jump.prototype.__timeshift = function(deltaTime)
{
    if (this._elapsed !== undefined) {
        this._host.physics.force.y += this.force;
        this._elapsed += deltaTime;
        if (this._elapsed >= this.duration) {
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
    this._elapsed = 0;
}

Engine.traits.Jump.prototype.end = function()
{
    this._elapsed = undefined;
}
