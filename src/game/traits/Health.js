Game.traits.Health = function()
{
    Engine.Trait.apply(this, arguments);
    Engine.logic.Energy.apply(this, arguments);

    this._lastValue = undefined;
}

Engine.Util.extend(Game.traits.Health, Engine.Trait);
Engine.Util.mixin(Game.traits.Health, Engine.logic.Energy);

Game.traits.Health.prototype.NAME = 'health';

Game.traits.Health.prototype.EVENT_HEALED = 'healed';
Game.traits.Health.prototype.EVENT_HURT = 'hurt';
Game.traits.Health.prototype.EVENT_HEALTH_CHANGED = 'health-changed';

Game.traits.Health.prototype.__timeshift = function healthUpdate(dt)
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
