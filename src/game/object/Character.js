Game.objects.Character = function()
{
    Engine.Object.call(this);

    this.ai = new Engine.AI(this);

    this.contactDamage = this.applyTrait(new Engine.traits.ContactDamage());
    this.dead = false;

    this.health = this.applyTrait(new Engine.traits.Health(100));
    this.isSupported = false;

    this.invincibility = this.applyTrait(new Engine.traits.Invincibility());

    this.jump = this.applyTrait(new Engine.traits.Jump());

    this.physics = this.applyTrait(new Engine.traits.Physics());
    this.physics.mass = 1;

    this.move = this.applyTrait(new Engine.traits.Move());

    this.stunnedDuration = .5;
    this.stunnedTime = false;

    this.weapon = this.applyTrait(new Engine.traits.Weapon());
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
    this.stunnedTime = this.stunnedDuration;
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

Game.objects.Character.prototype.obstruct = function(object, attack)
{
    Engine.Object.prototype.obstruct.call(this, object, attack);

    switch (attack) {
        case object.solid.TOP:
            this.isSupported = true;
            this.physics.inertia.copy(object.velocity);
            break;

        case object.solid.BOTTOM:
            this.physics.inertia.copy(object.velocity);
            break;

        case object.solid.LEFT:
        case object.solid.RIGHT:
            this.moveSpeed = Math.abs(object.velocity.x);
            break;
    }
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

    if (this.stunnedTime > 0) {
        this.stunnedTime -= dt;
    }

    Engine.Object.prototype.timeShift.call(this, dt);
}

Game.objects.characters = {};
