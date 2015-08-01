Engine.traits.Health = function()
{
    Engine.Trait.apply(this, arguments);
    Engine.traits._Energy.apply(this, arguments);

    this._lastValue = undefined;
}

Engine.Util.extend(Engine.traits.Health, Engine.Trait);
Engine.Util.mixin(Engine.traits.Health, Engine.traits._Energy);

Engine.traits.Health.prototype.NAME = 'health';

Engine.traits.Health.prototype.EVENT_DAMAGED = 'damaged';
Engine.traits.Health.prototype.EVENT_HEALED = 'healed';
Engine.traits.Health.prototype.EVENT_HEALTH_CHANGED = 'health-changed';

Engine.traits.Health.prototype.__timeshift = function healthUpdate(dt)
{
    if (this._lastValue !== this._value) {
        this.object.trigger(this.EVENT_HEALTH_CHANGED);

        if (this._value > this.cached_value) {
            this.object.trigger(this.EVENT_HEALED);
        }
        else {
            this.object.trigger(this.EVENT_DAMAGED);
        }

        this._lastValue = this._value;
    }

    if (this.depleted) {
        this.object.kill();
    }
}
