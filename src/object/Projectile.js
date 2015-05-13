Engine.assets.Projectile = function()
{
    Engine.assets.Object.call(this);
    this.damage = 0;
    this.range = 300;
    this.origin = undefined;
    this.velocity = 0;
}

Engine.assets.Projectile.prototype = Object.create(Engine.assets.Object.prototype);
Engine.assets.Projectile.constructor = Engine.assets.Projectile;

Engine.assets.Projectile.prototype.collides = function(withObject, ourZone, theirZone)
{
    if (!withObject.health) {
        return false;
    }

    if (this.emitter == withObject) {
        return false;
    }

    if (withObject.impactProjectile) {
        withObject.impactProjectile(this);
    }

    return true;
}

Engine.assets.Projectile.prototype.rangeReached = function()
{
    this.scene.removeObject(this);
}

Engine.assets.Projectile.prototype.setDamage = function(points)
{
    this.damage = points;
}

Engine.assets.Projectile.prototype.setEmitter = function(character)
{
    Engine.assets.Object.prototype.setEmitter.call(this, character);
    var origin = this.emitter.model.position.clone();
    origin.x += this.emitter.projectileEmitOffset.x * this.emitter.direction;
    origin.y += this.emitter.projectileEmitOffset.y;
    this.setOrigin(origin);
}

Engine.assets.Projectile.prototype.setOrigin = function(vector)
{
    if (vector instanceof THREE.Vector3 === false) {
        throw new Error('Require THREE.Vector3 for origin');
    }
    this.model.position.x = vector.x;
    this.model.position.y = vector.y;
    this.origin = vector;
}

Engine.assets.Projectile.prototype.setRange = function(distance)
{
    this.range = distance;
}

Engine.assets.Projectile.prototype.setVelocity = function(v)
{
    this.velocity = v;
}

Engine.assets.Projectile.prototype.timeShift = function(dt)
{
    Engine.assets.Object.prototype.timeShift.call(this, dt);
    if (this.origin) {
        if (this.model.position.distanceTo(this.origin) > this.range) {
            this.rangeReached();
        }
    }
}

Engine.assets.projectiles = {};
