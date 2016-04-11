Game.objects.Projectile = function()
{
    Engine.Object.call(this);

    this.damage = 0;
    this.lifetime = Infinity;
    this.origin = new THREE.Vector2();
    this.penetratingForce = false;
    this.setRange(300);
    this.setSpeed(100);
}

Engine.Util.extend(Game.objects.Projectile, Engine.Object);

Game.objects.Projectile.prototype.EVENT_RECYCLE = 'recycle';

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
                this.recycle();
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

Game.objects.Projectile.prototype.getLifetime = function()
{
    if (this.speed) {
        return this.range / this.speed;
    }
    return Infinity;
}

Game.objects.Projectile.prototype.rangeReached = function()
{
    this.recycle();
}

Game.objects.Projectile.prototype.recycle = function()
{
    this.time = 0;
    this.trigger(this.EVENT_RECYCLE, [this]);
}

Game.objects.Projectile.prototype.setDamage = function(points)
{
    this.damage = points;
}

Game.objects.Projectile.prototype.setEmitter = function(emitter, direction)
{
    if (direction === undefined) {
        throw new Error("Direction not specified");
    }

    Engine.Object.prototype.setEmitter.apply(this, arguments);

    var origin = emitter.position.clone();
    origin.x += emitter.weapon.projectileEmitOffset.x * direction.x;
    origin.y += emitter.weapon.projectileEmitOffset.y;
    var radius = direction.clone().setLength(emitter.weapon.projectileEmitRadius);
    origin.add(radius);

    this.setOrigin(origin);
}

Game.objects.Projectile.prototype.setOrigin = function(vec)
{
    this.moveTo(vec);
    this.origin.copy(vec);
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
