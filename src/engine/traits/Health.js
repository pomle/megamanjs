Engine.traits.Health = function()
{
    Engine.Trait.apply(this, arguments);
    Engine.logic.Energy.apply(this, arguments);

    this._lastValue = undefined;
}

Engine.Util.extend(Engine.traits.Health, Engine.Trait);
Engine.Util.mixin(Engine.traits.Health, Engine.logic.Energy);

Engine.traits.Health.prototype.NAME = 'health';

Engine.traits.Health.prototype.EVENT_HEALED = 'healed';
Engine.traits.Health.prototype.EVENT_HURT = 'hurt';
Engine.traits.Health.prototype.EVENT_HEALTH_CHANGED = 'health-changed';

Engine.traits.Health.prototype.__timeshift = function healthUpdate(dt)
{
    if (this._lastValue !== this._value) {
        this._host.trigger(this.EVENT_HEALTH_CHANGED);

        if (this._value > this._lastValue) {
            this._host.trigger(this.EVENT_HEALED);
        }
        else if (this._value < this._lastValue) {
            this._host.trigger(this.EVENT_HURT);
        }

        this._lastValue = this._value;
    }

    if (this.depleted) {
        this._host.kill();
    }
}
