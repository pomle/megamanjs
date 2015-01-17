Engine.assets.Projectile = function()
{
    Engine.assets.Object.call(this);
    this.damage = 0;
    this.emitter = undefined;
    this.reach = 300;
    this.origin = undefined;
    this.velocity = 0;
}

Engine.assets.Projectile.prototype = Object.create(Engine.assets.Object.prototype);

Engine.assets.Projectile.prototype.collides = function(withObject, ourZone, theirZone)
{
    if (!withObject.health) {
        return false;
    }

    if (this.emitter == withObject) {
        return false;
    }

    withObject.health.reduce(this.damage);

    console.log('Inflicting %f damage on %s', this.damage, withObject);
    this.scene.removeObject(this);

    return true;
}

Engine.assets.Projectile.prototype.setDamage = function(points)
{
    this.damage = points;
}

Engine.assets.Projectile.prototype.setEmitter = function(character)
{
    if (character instanceof Engine.assets.objects.Character !== true) {
        throw new Error('Invalid user');
    }
    this.emitter = character;
    var origin = this.emitter.model.position.clone();
    origin.x += (12 * this.emitter.direction);
    origin.y += 1;
    this.setOrigin(origin);
}

Engine.assets.Projectile.prototype.setOrigin = function(vector)
{
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

Engine.assets.Projectile.prototype.timeShift = function(t)
{
    if (this.origin) {
        if (this.model.position.distanceTo(this.origin) > this.reach) {
            this.scene.removeObject(this);
        }
    }
    Engine.assets.Object.prototype.timeShift.call(this, t);
}

Engine.assets.projectiles = {};
