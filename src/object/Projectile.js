Engine.assets.Projectile = function()
{
    Engine.assets.Object.call(this);
    this.damage = 0;
    this.reach = 300;
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

    if (withObject.inflictDamage && !withObject.isInvincible) {
        console.log('Inflicting %f damage on %s', this.damage, withObject);
        withObject.inflictDamage(this.damage);

        if (!withObject.health.depleted()) {
            this.scene.removeObject(this);
        }
    }

    return true;
}

Engine.assets.Projectile.prototype.setDamage = function(points)
{
    this.damage = points;
}

Engine.assets.Projectile.prototype.setEmitter = function(character)
{
    Engine.assets.Object.prototype.setEmitter.call(this, character);
    var origin = this.emitter.model.position.clone();
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

Engine.assets.Projectile.prototype.setReach = function(distance)
{
    this.reach = distance;
}

Engine.assets.Projectile.prototype.setVelocity = function(v)
{
    this.velocity = v;
}

Engine.assets.Projectile.prototype.timeShift = function(dt)
{
    if (this.origin) {
        if (this.model.position.distanceTo(this.origin) > this.reach) {
            this.scene.removeObject(this);
        }
    }
    Engine.assets.Object.prototype.timeShift.call(this, dt);
}

Engine.assets.projectiles = {};
