Game.traits.Jump = function()
{
    Engine.Trait.call(this);

    this._elapsed = undefined;
    this._bump = 0;

    this.duration = .18;
    this.force = 100;
    this.falloff =  1;
}

Engine.Util.extend(Game.traits.Jump, Engine.Trait);

Game.traits.Jump.prototype.NAME = 'jump';

Game.traits.Jump.prototype.__obstruct = function(object, attack)
{
    switch (attack) {
        case object.SURFACE_TOP:
            this._host.isSupported = true;
            break;

        case object.SURFACE_BOTTOM:
            this._end();
            break;
    }
}

Game.traits.Jump.prototype.__timeshift = function(deltaTime)
{
    if (this._elapsed === undefined) {
        return;
    }

    if (this._elapsed >= this.duration) {
        this._end();
    }
    else {
        this._host.physics.force.y += this._bump;
        this._bump *= this.falloff;
        this._elapsed += deltaTime;
    }
}

Game.traits.Jump.prototype.engage = function()
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
    this._bump = this.force;
    this._elapsed = 0;
}

Game.traits.Jump.prototype.cancel = function()
{
    if (this._elapsed !== undefined) {
        var fx = Math.abs(this._elapsed - this.duration) / this.duration;
        this._host.physics.force.y -= this.force * fx;
    }
    this._end();
}

Game.traits.Jump.prototype._end = function()
{
    this._elapsed = undefined;
}
