const Trait = require('../Trait');
const Energy = require('../logic/Energy');

class Health extends Trait
{
    constructor()
    {
        super();

        this.NAME = 'health';

        this.EVENT_DEATH = 'death';
        this.EVENT_HEALED = 'healed';
        this.EVENT_HURT = 'hurt';
        this.EVENT_RESURRECT = 'resurrect';
        this.EVENT_HEALTH_CHANGED = 'health-changed';

        this.energy = new Energy(100);
        this.immune = false;
        this._dead = false;

        const onChange = () => {
            this._trigger(this.EVENT_HEALTH_CHANGED, [this]);
            if (!this._dead && this.energy.depleted) {
                this.kill();
            } else if (this._dead && !this.energy.depleted) {
                this.resurrect();
            }
        };

        this.events.bind(this.EVENT_ATTACHED, () => {
            this.energy.events.bind(this.energy.EVENT_CHANGE, onChange);
        });
        this.events.bind(this.EVENT_DETACHED, () => {
            this.energy.events.unbind(this.energy.EVENT_CHANGE, onChange);
        });
    }
    __collides(withObject)
    {
        if (withObject.pickupable && !this.energy.full) {
            const props = withObject.pickupable.properties;
            if (props.type === 'energy-tank') {
                withObject.world.removeObject(withObject);
                this.energy.amount += props.capacity;
                this._trigger(this.EVENT_HEALED);
            }
        }
    }
    kill()
    {
        if (this._dead === true) {
            return;
        }

        this._dead = true;
        this.energy.deplete();

        this._trigger(this.EVENT_DEATH, [this]);
        this._host.removeFromWorld();
    }
    inflictDamage(points, direction)
    {
        if (this.immune === true) {
            return false;
        }
        this.energy.amount -= points;
        this._trigger(this.EVENT_HURT, [points, direction]);
        return true;
    }
    reset()
    {
        this.resurrect();
        this.energy.fill();
    }
    resurrect()
    {
        if (this._dead === false) {
            return;
        }

        this._dead = false;
        this.energy.fill();
        this._trigger(this.EVENT_RESURRECT);
    }
}

module.exports = Health;
