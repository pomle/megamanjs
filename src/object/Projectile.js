Engine.assets.Projectile = function()
{
    Engine.assets.Object.call(this);
    this.damage = 0;
    this.distanceCovered = 0;
    this.penetratingForce = false;
    this.range = 300;
    this.origin = undefined;
    this.speed = 0;
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
        if (!this.penetratingForce || !withObject.health.isDepleted()) {
            this.scene.removeObject(this);
        }
    }

    return true;
}

Engine.assets.Projectile.prototype.deflect = function()
{
    this.dropCollision();
    this.inertia.x = -this.inertia.x;
    this.inertia.y = 100;
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

Engine.assets.Projectile.prototype.setSpeed = function(v)
{
    this.speed = v;
}

Engine.assets.Projectile.prototype.timeShift = function(dt)
{
    Engine.assets.Object.prototype.timeShift.call(this, dt);
    this.distanceCovered += (this.velocity.length() * dt);
    if (this.distanceCovered > this.range) {
        this.rangeReached();
    }
}

Engine.assets.projectiles = {};
