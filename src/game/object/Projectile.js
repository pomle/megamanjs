Game.objects.Projectile = function()
{
    Engine.Object.call(this);

    this.damage = 0;
    this.distanceCovered = 0;
    this.lifetime = Infinity;
    this.origin = undefined;
    this.penetratingForce = false;
    this.setRange(300);
    this.setSpeed(100);
}

Game.objects.Projectile.prototype = Object.create(Engine.Object.prototype);
Game.objects.Projectile.constructor = Game.objects.Projectile;

Game.objects.Projectile.prototype.getLifetime = function()
{
    if (this.speed) {
        return this.range / this.speed;
    }
    return Infinity;
}

Game.objects.Projectile.prototype.collides = function(withObject, ourZone, theirZone)
{
    if (!withObject.health) {
        return false;
    }

    if (this.emitter == withObject) {
        return false;
    }

    if (withObject.impactProjectile) {
        if (withObject.impactProjectile(this)) {
            if (!this.penetratingForce || !withObject.health.depleted) {
                this.world.removeObject(this);
            }
        }
    }

    return true;
}

Game.objects.Projectile.prototype.deflect = function()
{
    this.dropCollision();
    var l = this.velocity.length();
    this.velocity.x = -this.velocity.x;
    this.velocity.y = 100;
    this.velocity.setLength(l);
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
    origin.x += this.emitter.weapon.projectileEmitOffset.x * this.emitter.direction.x;
    origin.y += this.emitter.weapon.projectileEmitOffset.y;
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
    this.lifetime = this.getLifetime();
}

Game.objects.Projectile.prototype.setSpeed = function(v)
{
    this.speed = v;
    this.lifetime = this.getLifetime();
}

Game.objects.Projectile.prototype.timeShift = function(deltaTime)
{
    Engine.Object.prototype.timeShift.call(this, deltaTime);
    if (this.time > this.lifetime) {
        this.rangeReached();
    }
}

Game.objects.projectiles = {};
