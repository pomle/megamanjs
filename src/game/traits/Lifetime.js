Game.traits.Lifetime = function()
{
    Engine.Trait.call(this);
    this._time = 0;
    this.duration = Infinity;
}

Engine.Util.extend(Game.traits.Lifetime, Engine.Trait);

Game.traits.Lifetime.prototype.NAME = 'lifetime';

Game.traits.Lifetime.prototype.__timeshift = function(dt)
{
    if (this._time > this.duration) {
        var host = this._host;
        host.world.removeObject(host);
    } else {
        this._time += dt;
    }
}

Game.traits.Lifetime.prototype.reset = function()
{
    this._time = 0;
}
