Game.traits.Projectile = class Projectile extends Engine.Trait
{
    constructor()
    {
        super();

        this.NAME = 'projectile';
        this.EVENT_RECYCLE = 'recycle';

        this._time = 0;

        this._damage = 0;
        this._lifetime = Infinity;
        this._origin = new THREE.Vector2();
        this._range = Infinity;
        this._speed = 0;

        this.penetratingForce = false;
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
        if (!this.penetratingForce || !withObject.health.depleted) {
            this.recycle();
        }
    }
    __timeshift(deltaTime)
    {
        this._time += deltaTime;
        if (this._time > this._lifetime) {
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
    getLifetime()
    {
        if (this._speed) {
            return this._range / this._speed;
        }
        return Infinity;
    }
    rangeReached()
    {
        this.recycle();
    }
    reset()
    {
        this._host.collidable = true;
        this._time = 0;
    }
    recycle()
    {
        this._host.reset();
        this._trigger(this.EVENT_RECYCLE, [this._host]);
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
        this._lifetime = this.getLifetime();
    }
    setSpeed(speed)
    {
        this._speed = speed;
        this._lifetime = this.getLifetime();
    }
    setLifetime(speed)
    {

    }
}
