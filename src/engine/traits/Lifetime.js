Engine.traits.Lifetime = function()
{
    Engine.Trait.call(this);
    this._time = 0;
    this.duration = Infinity;
}

Engine.Util.extend(Engine.traits.Lifetime, Engine.Trait);

Engine.traits.Lifetime.prototype.NAME = 'lifetime';

Engine.traits.Lifetime.prototype.__timeshift = function(dt)
{
    if (this._time > this.duration) {
        var host = this._host;
        host.world.removeObject(host);
    } else {
        this._time += dt;
    }
}

Engine.traits.Lifetime.prototype.reset = function()
{
    this._time = 0;
}
