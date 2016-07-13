Game.traits.Health = function()
{
    Engine.Trait.call(this);
    Engine.logic.Energy.call(this);

    this.immune = false;
    this._dead = false;

    const onChange = () => {
        this._trigger(this.EVENT_HEALTH_CHANGED, [this]);
        if (!this._dead && this.depleted) {
            this.kill();
        } else if (this._dead && !this.depleted) {
            this.resurrect();
        }
    };

    this.events.bind(this.EVENT_CHANGE, onChange);
}

Engine.Util.extend(Game.traits.Health, Engine.Trait);
Engine.Util.mixin(Game.traits.Health, Engine.logic.Energy);

Game.traits.Health.prototype.NAME = 'health';

Game.traits.Health.prototype.EVENT_DEATH = 'death';
Game.traits.Health.prototype.EVENT_HEALED = 'healed';
Game.traits.Health.prototype.EVENT_HURT = 'hurt';
Game.traits.Health.prototype.EVENT_RESURRECT = 'resurrect';
Game.traits.Health.prototype.EVENT_HEALTH_CHANGED = 'health-changed';

Game.traits.Health.prototype.__collides = function(withObject)
{
    if (withObject.pickupable && !this.full) {
        var props = withObject.pickupable.properties;
        if (props.type === 'energy-tank') {
            withObject.world.removeObject(withObject);
            this.amount += props.capacity;
            this._trigger(this.EVENT_HEALED);
        }
    }
}

Game.traits.Health.prototype.kill = function()
{
    if (this._dead === true) {
        return;
    }

    this._dead = true;
    this.deplete();

    this._trigger(this.EVENT_DEATH, [this]);
    this._host.removeFromWorld();
}

Game.traits.Health.prototype.inflictDamage = function(points, direction)
{
    if (this.immune === true) {
        return false;
    }
    this.amount -= points;
    this._trigger(this.EVENT_HURT, [points, direction]);
    return true;
}

Game.traits.Health.prototype.resurrect = function()
{
    if (this._dead === false) {
        return;
    }

    this._dead = false;
    this.fill();
    this._trigger(this.EVENT_RESURRECT);
}
