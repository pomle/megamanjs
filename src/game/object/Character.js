Game.objects.Character = function()
{
    Engine.Object.call(this);
    this.ai = new Engine.AI(this);
    this.aim = new THREE.Vector2();
    this.health = this.applyTrait(new Game.traits.Health(100));

    this.dead = false;
    this.direction.x = this.DIRECTION_RIGHT;
    this.isClimbing = false;
    this.isSupported = false;

    this.animator = undefined;
}

Engine.Util.extend(Game.objects.Character, Engine.Object);

Game.objects.Character.prototype.EVENT_DAMAGE = 'damage';
Game.objects.Character.prototype.EVENT_DEATH = 'death';
Game.objects.Character.prototype.EVENT_RESURRECT = 'resurrect';

Game.objects.Character.prototype.getDeathObject = function()
{
    return new Game.objects.decorations.TinyExplosion();
}

Game.objects.Character.prototype.impactProjectile = function(projectile)
{
    if (projectile instanceof Game.objects.Projectile !== true) {
        throw new Error('Invalid projectile');
    }

    var direction = projectile.position.clone().sub(this.position);
    return this.health.inflictDamage(projectile.damage, direction);
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

Game.objects.Character.prototype.routeAnimation = function()
{
}

Game.objects.Character.prototype.timeShift = function(dt)
{
    this.routeAnimation();
    this.isSupported = false;
    Engine.Object.prototype.timeShift.call(this, dt);
}

Game.objects.characters = {};
