Engine.traits.Health = function()
{
    Engine.Trait.apply(this, arguments);
    Engine.traits._Energy.apply(this, arguments);

    this._cached_value = undefined;
    this.event = function() {};
}

Engine.Util.extend(Engine.traits.Health, Engine.Trait);
Engine.Util.mixin(Engine.traits.Health, Engine.traits._Energy);

Engine.traits.Health.prototype.NAME = 'health';

Engine.traits.Health.prototype.__timeshift = function(dt)
{
    if (this._cached_value !== this._value) {
        this.event();
        this._cached_value = this._value;
    }

    if (this.depleted) {
        this.object.kill();
    }
}
