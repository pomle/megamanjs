Game.objects.Character = function()
{
    Engine.Object.call(this);

    this.ai = new Engine.AI(this);

    this.contactDamage = 0;
    this.dead = false;
    this.direction = undefined;
    this.fireTimeout = .25;
    this.health = this.applyTrait(new Engine.traits.Health(100));
    this.isFiring = false;
    this.isSupported = false;

    this.invincibility = this.applyTrait(new Engine.traits.Invincibility());

    this.jump = this.applyTrait(new Engine.traits.Jump());

    this.physics = this.applyTrait(new Engine.traits.Physics());
    this.physics.mass = 1;

    this.move = this.applyTrait(new Engine.traits.Move());


    this.projectileEmitOffset = new THREE.Vector2();
    this.stunnedDuration = .5;
    this.stunnedTime = false;

    this.weapon = undefined;
}

Game.objects.Character.prototype.EVENT_DEATH = 'death';
Game.objects.Character.prototype.EVENT_RESURRECT = 'resurrect';

Game.objects.Character.prototype = Object.create(Engine.Object.prototype);
Game.objects.Character.constructor = Game.objects.Character;

Game.objects.Character.prototype.LEFT = -1;
Game.objects.Character.prototype.RIGHT = 1;

Game.objects.Character.prototype.collides = function(withObject, ourZone, theirZone)
{
    if (this.contactDamage > 0 && withObject.health) {
        withObject.inflictDamage(this.contactDamage);
    }
    Engine.Object.prototype.collides.call(this, withObject, ourZone, theirZone);
}

Game.objects.Character.prototype.equipWeapon = function(weapon)
{
    if (weapon instanceof Game.objects.Weapon !== true) {
        throw new Error('Invalid weapon');
    }
    this.weapon = weapon;
    this.weapon.setUser(this);
    return true;
}

Game.objects.Character.prototype.fire = function()
{
    if (this.stunnedTime > 0) {
        return false;
    }

    if (!this.weapon) {
        return false;
    }

    if (!this.weapon.fire()) {
        return false;
    }

    this.isFiring = this.fireTimeout;

    return true;
}

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
        this.weapon.timeShift(0);
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

Game.objects.Character.prototype.setDirection = function(d)
{
    this.direction = d;
}

Game.objects.Character.prototype.timeShift = function(dt)
{
    this.isSupported = false;

    if (this.stunnedTime > 0) {
        this.stunnedTime -= dt;
    }

    if (this.isFiring > 0) {
        this.isFiring -= dt;
        if (this.isFiring <= 0) {
            this.isFiring = false;
        }
    }

    if (this.weapon) {
        this.weapon.timeShift(dt);
    }

    Engine.Object.prototype.timeShift.call(this, dt);
}

Game.objects.characters = {};
