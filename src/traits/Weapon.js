const {Vector2} = require('three');
const {Trait} = require('@snakesilk/engine');

class Weapon extends Trait
{
    constructor()
    {
        super();
        this.NAME = 'weapon';

        this.EVENT_FIRE = 'weapon-fire';
        this.EVENT_EQUIP = 'weapon-equip';

        this._firing = false;

        // Duration host left in shooting state after fire.
        this._timeout = .25;
        this._duration = Infinity;
        this._weapon = undefined;
        this.projectileEmitOffset = new Vector2();
        this.projectileEmitRadius = 0;
    }
    __collides(withObject)
    {
        if (withObject.pickupable && this._weapon && this._weapon.ammo.full === false) {
            const props = withObject.pickupable.properties;
            if (props.type === 'weapon-tank') {
                withObject.world.removeObject(withObject);
                this._weapon.ammo.amount += props.capacity;
            }
        }
    }
    __timeshift(deltaTime)
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
    equip(weapon)
    {
        this._weapon = weapon;
        this._weapon.setUser(this._host);
        this._trigger(this.EVENT_EQUIP, [weapon]);
    }
    fire()
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
}

module.exports = Weapon;
