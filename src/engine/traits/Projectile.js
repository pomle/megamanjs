const THREE = require('three');
const Trait = require('../Trait');

class Projectile extends Trait
{
    constructor()
    {
        super();

        this.NAME = 'projectile';
        this.EVENT_HIT = 'hit';
        this.EVENT_RECYCLE = 'recycle';
        this.EVENT_RECYCLED = 'recycled';

        this._damage = 0;
        this._origin = new THREE.Vector2();
        this._range = Infinity;
        this._speed = 0;

        this.penetratingForce = false;

        const onRecycle = () => {
            this.recycle();
        };

        this.events.bind(this.EVENT_ATTACHED, host => {
            host.events.bind(this.EVENT_RECYCLE, onRecycle);
        });
        this.events.bind(this.EVENT_DETACHED, host => {
            host.events.unbind(this.EVENT_RECYCLE, onRecycle);
        });
    }
    __collides(withObject, ourZone, theirZone)
    {
        if (!withObject.health) {
            return false;
        }

        if (this._host.emitter == withObject) {
            return false;
        }

        const direction = this._host.position.clone().sub(withObject.position);
        withObject.health.inflictDamage(this._damage, direction);
        withObject.events.trigger(this.EVENT_HIT, [this._host]);
        if (!this.penetratingForce || !withObject.health.energy.depleted) {
            this.recycle();
        }
    }
    __timeshift(deltaTime)
    {
        if (this._origin.distanceTo(this._host.position) >= this._range) {
            this.rangeReached();
        }
    }
    deflect()
    {
        const host = this._host;
        host.collidable = false;
        const vel = host.velocity;
        const speed = vel.length();
        vel.x = -vel.x;
        vel.y = 100;
        vel.setLength(speed);
    }
    rangeReached()
    {
        this.recycle();
    }
    reset()
    {
        this._host.collidable = true;
    }
    recycle()
    {
        this._host.reset();
        this._trigger(this.EVENT_RECYCLED, [this._host]);
    }
    setDamage(points)
    {
        this._damage = points;
    }
    setDirection(vec)
    {
        this._host.velocity.copy(vec).setLength(this._speed);
        this._host.direction.copy(vec);
    }
    setOrigin(vec)
    {
        this._host.moveTo(vec);
        this._origin.copy(vec);
    }
    setRange(range)
    {
        this._range = range;
    }
    setSpeed(speed)
    {
        this._speed = speed;
    }
}

module.exports = Projectile;
