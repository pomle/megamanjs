Game.objects.Character = function()
{
    Engine.Object.call(this);
    this.ai = new Engine.AI(this);
    this.health = this.applyTrait(new Engine.traits.Health(100));

    this.dead = false;
    this.direction.x = this.DIRECTION_RIGHT;
    this.isClimbing = false;
    this.isSupported = false;

    this.animator = undefined;
}

Game.objects.Character.prototype.EVENT_DEATH = 'death';
Game.objects.Character.prototype.EVENT_RESURRECT = 'resurrect';

Game.objects.Character.prototype = Object.create(Engine.Object.prototype);
Game.objects.Character.constructor = Game.objects.Character;

Game.objects.Character.prototype.getDeathObject = function()
{
    return new Game.objects.decorations.TinyExplosion();
}

Game.objects.Character.prototype.impactProjectile = function(projectile)
{
    if (projectile instanceof Game.objects.Projectile !== true) {
        throw new Error('Invalid projectile');
    }

    if (this.inflictDamage(projectile.damage,
                           projectile.position.clone()
                               .sub(this.position))) {
        return true;
    }
    return false;
}

Game.objects.Character.prototype.inflictDamage = function(points, direction)
{
    if (this.health.infinite) {
        return false;
    }
    this.health.amount -= points;
    return true;
}

Game.objects.Character.prototype.kill = function()
{
    this.dead = true;
    this.health.deplete();

    /* Notify object that something happened. */
    if (this.weapon) {
        this.weapon.__timeshift(0);
    }

    var explosion = this.getDeathObject();
    explosion.position.copy(this.position);
    this.world.addObject(explosion);
    this.world.removeObject(this);
    this.trigger(this.EVENT_DEATH);
}

Game.objects.Character.prototype.resurrect = function()
{
    this.dead = false;
    this.health.fill();
    this.trigger(this.EVENT_RESURRECT);
}

Game.objects.Character.prototype.timeShift = function(dt)
{
    this.isSupported = false;
    Engine.Object.prototype.timeShift.call(this, dt);
}

Game.objects.characters = {};
