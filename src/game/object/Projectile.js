Engine.assets.Projectile = function()
{
    Engine.Object.call(this);
    this.damage = 0;
    this.distanceCovered = 0;
    this.penetratingForce = false;
    this.range = 300;
    this.origin = undefined;
    this.speed = 0;
}

Engine.assets.Projectile.prototype = Object.create(Engine.Object.prototype);
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
    this.physics.inertia.x = -this.physics.inertia.x;
    this.physics.inertia.y = 100;
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
    Engine.Object.prototype.setEmitter.call(this, character);
    var origin = this.emitter.position.clone();
    origin.x += this.emitter.projectileEmitOffset.x * this.emitter.direction;
    origin.y += this.emitter.projectileEmitOffset.y;
    this.setOrigin(origin);
}

Engine.assets.Projectile.prototype.setOrigin = function(vec)
{
    this.moveTo(vec);
    this.origin = vec;
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
    Engine.Object.prototype.timeShift.call(this, dt);
    this.distanceCovered += (this.velocity.length() * dt);
    if (this.distanceCovered > this.range) {
        this.rangeReached();
    }
}

Engine.assets.projectiles = {};
