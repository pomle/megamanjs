Game.objects.Projectile = function()
{
    Engine.Object.call(this);
    this.applyTrait(new Engine.traits.Physics());
    this.physics.mass = 0;

    this.damage = 0;
    this.distanceCovered = 0;
    this.penetratingForce = false;
    this.range = 300;
    this.origin = undefined;
    this.speed = 0;
}

Game.objects.Projectile.prototype = Object.create(Engine.Object.prototype);
Game.objects.Projectile.constructor = Game.objects.Projectile;

Game.objects.Projectile.prototype.collides = function(withObject, ourZone, theirZone)
{
    if (!withObject.health) {
        return false;
    }

    if (this.emitter == withObject) {
        return false;
    }

    if (withObject.impactProjectile) {
        withObject.impactProjectile(this);
        if (!this.penetratingForce || !withObject.health.depleted) {
            this.world.removeObject(this);
        }
    }

    return true;
}

Game.objects.Projectile.prototype.deflect = function()
{
    this.dropCollision();
    this.physics.inertia.x = -this.physics.inertia.x;
    this.physics.inertia.y = 100;
}

Game.objects.Projectile.prototype.rangeReached = function()
{
    this.world.removeObject(this);
}

Game.objects.Projectile.prototype.setDamage = function(points)
{
    this.damage = points;
}

Game.objects.Projectile.prototype.setEmitter = function(character)
{
    Engine.Object.prototype.setEmitter.call(this, character);
    var origin = this.emitter.position.clone();
    origin.x += this.emitter.projectileEmitOffset.x * this.emitter.direction;
    origin.y += this.emitter.projectileEmitOffset.y;
    this.setOrigin(origin);
}

Game.objects.Projectile.prototype.setOrigin = function(vec)
{
    this.moveTo(vec);
    this.origin = vec;
}

Game.objects.Projectile.prototype.setRange = function(distance)
{
    this.range = distance;
}

Game.objects.Projectile.prototype.setSpeed = function(v)
{
    this.speed = v;
}

Game.objects.Projectile.prototype.timeShift = function(dt)
{
    Engine.Object.prototype.timeShift.call(this, dt);
    this.distanceCovered += (this.velocity.length() * dt);
    if (this.distanceCovered > this.range) {
        this.rangeReached();
    }
}

Game.objects.projectiles = {};
