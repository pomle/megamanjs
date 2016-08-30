Game.traits.Weapon = function()
{
    Engine.Trait.call(this);

    this._firing = false;

    // Duration host left in shooting state after fire.
    this._timeout = .25;
    this._duration = Infinity;
    this._weapon = undefined;
    this.projectileEmitOffset = new THREE.Vector2();
    this.projectileEmitRadius = 0;
}

Engine.Util.extend(Game.traits.Weapon, Engine.Trait);

Game.traits.Weapon.prototype.NAME = 'weapon';

Game.traits.Weapon.prototype.EVENT_FIRE = 'weapon-fire';
Game.traits.Weapon.prototype.EVENT_EQUIP = 'weapon-equip';

Game.traits.Weapon.prototype.__collides = function(withObject)
{
    if (withObject.pickupable && this._weapon && this._weapon.ammo.full === false) {
        var props = withObject.pickupable.properties;
        if (props.type === 'weapon-tank') {
            withObject.world.removeObject(withObject);
            this._weapon.ammo.amount += props.capacity;
        }
    }
}

Game.traits.Weapon.prototype.__timeshift = function(deltaTime)
{
    if (this._firing) {
        this._duration += deltaTime;
        if (this._duration >= this._timeout) {
            this._duration = Infinity;
            this._firing = false;
        }
    }

    if (this._weapon !== undefined) {
        this._weapon.timeShift(deltaTime);
    }
}

Game.traits.Weapon.prototype.equip = function(weapon)
{
    if (weapon instanceof Game.objects.Weapon === false) {
        throw new Error('Invalid weapon');
    }
    this._weapon = weapon;
    this._weapon.setUser(this._host);
    this._trigger(this.EVENT_EQUIP, [weapon]);
}

Game.traits.Weapon.prototype.fire = function()
{
    if (this._host.stun && this._host.stun._engaged === true) {
        return false;
    }

    if (this._weapon === undefined) {
        return false;
    }

    if (!this._weapon.fire()) {
        return false;
    }

    this._firing = true;
    this._duration = 0;

    this._trigger(this.EVENT_FIRE, [this._weapon.id]);
    return true;
}

