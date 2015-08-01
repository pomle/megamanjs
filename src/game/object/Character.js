Game.objects.Character = function()
{
    Engine.Object.call(this);

    this.ai = new Engine.AI(this);

    this.contactDamage = 0;
    this.dead = false;
    this.direction = undefined;
    this.fireTimeout = .25;
    this.applyTrait(new Engine.traits.Health(100));
    this.invincibilityDuration = 0;
    this.isFiring = false;
    this.isInvincible = false;
    this.isSupported = false;

    this.jumpDuration = .18;
    this.jumpForce = 180;
    this.jumpInertia = 0;
    this.jumpTime = undefined;

    this.moveSpeed = 0;

    this.applyTrait(new Engine.traits.Physics());
    this.physics.mass = 1;
    this.projectileEmitOffset = new THREE.Vector2();
    this.stunnedDuration = .5;
    this.stunnedTime = false;

    this.walkAcc = 500;
    this.walkSpeed = 90;
    this.walk = 0;
    this.weapon = undefined;
}

Game.objects.Character.prototype.EVENT_DEATH = 'death';
Game.objects.Character.prototype.EVENT_RESURRECT = 'resurrect';

Game.objects.Character.prototype = Object.create(Engine.Object.prototype);
Game.objects.Character.constructor = Game.objects.Character;

Game.objects.Character.prototype.LEFT = -1;
Game.objects.Character.prototype.RIGHT = 1;

Game.objects.Character.prototype.calculateMoveSpeed = function(dt)
{
    if (this.walk == 0) {
        this.moveSpeed = 0;
        return;
    }

    this.moveSpeed = Math.min(this.moveSpeed + this.walkAcc * dt, this.walkSpeed);
}

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
    if (this.isInvincible) {
        return false;
    }
    this.health.amount -= points;
    this.invincibilityStart();
    this.stunnedTime = this.stunnedDuration;
    return true;
}

Game.objects.Character.prototype.invincibilityStart = function()
{
    this.isInvincible = this.invincibilityDuration;
}

Game.objects.Character.prototype.invincibilityEnd = function()
{
    this.model.visible = true;
    this.isInvincible = false;
}

Game.objects.Character.prototype.jumpStart = function()
{
    if (this.stunnedTime > 0) {
        return false;
    }

    if (!this.isSupported) {
        return false;
    }
    this.isSupported = false;
    this.jumpInertia = this.physics.inertia.y + this.jumpForce;
    this.jumpTime = this.time;
}

Game.objects.Character.prototype.jumpEnd = function()
{
    this.jumpInertia = 0;
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

Game.objects.Character.prototype.moveLeftStart = function()
{
    this.walk--;
}

Game.objects.Character.prototype.moveLeftEnd = function()
{
    this.walk++;
}

Game.objects.Character.prototype.moveRightStart = function()
{
    this.walk++;
}

Game.objects.Character.prototype.moveRightEnd = function()
{
    this.walk--;
}

Game.objects.Character.prototype.obstruct = function(object, attack)
{
    Engine.Object.prototype.obstruct.call(this, object, attack);

    switch (attack) {
        case object.solid.TOP:
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

    switch (attack) {
        case object.solid.TOP:
            this.isSupported = true;
            break;

        case object.solid.BOTTOM:
            this.jumpEnd();
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
    else {
        this.physics.momentum.set(0, 0);
        if (this.walk) {
            this.setDirection(this.walk > 0 ? this.RIGHT : this.LEFT);
        }
        this.calculateMoveSpeed(dt);
        this.physics.momentum.x = (this.moveSpeed * this.walk);
    }

    if (this.isInvincible > 0) {
        this.isInvincible -= dt;
        this.model.visible = !this.model.visible;
    } else if (this.isInvincible <= 0) {
        this.invincibilityEnd();
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

    if (this.jumpInertia) {
        this.physics.inertia.y = this.jumpInertia;
        if (this.time - this.jumpTime > this.jumpDuration) {
            this.jumpEnd();
        }
    }

    Engine.Object.prototype.timeShift.call(this, dt);
}

Game.objects.characters = {};
