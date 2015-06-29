Engine.assets.objects.Character = function()
{
    Engine.assets.Object.call(this);

    this.ai = new Engine.AI(this);

    this.direction = undefined;
    this.fireTimeout = .25;
    this.health = new Engine.assets.Energy(100);
    this.invincibilityDuration = 0;
    this.isFiring = false;
    this.isInvincible = false;
    this.isSupported = false;

    this.jumpDuration = .18;
    this.jumpForce = 180;
    this.jumpInertia = 0;
    this.jumpTime = undefined;

    this.mass = 1;
    this.moveSpeed = 0;

    this.projectileEmitOffset = new THREE.Vector2();

    this.stunnedDuration = .5;
    this.stunnedTime = false;

    this.walkAcc = 500;
    this.walkSpeed = 90;
    this.walk = 0;
    this.weapon = undefined;
}

Engine.assets.objects.Character.prototype = Object.create(Engine.assets.Object.prototype);
Engine.assets.objects.Character.constructor = Engine.assets.objects.Character;

Engine.assets.objects.Character.prototype.LEFT = -1;
Engine.assets.objects.Character.prototype.RIGHT = 1;

Engine.assets.objects.Character.prototype.calculateMoveSpeed = function(dt)
{
    if (this.walk == 0) {
        this.moveSpeed = 0;
        return;
    }

    this.moveSpeed = Math.min(this.moveSpeed + this.walkAcc * dt, this.walkSpeed);
}

Engine.assets.objects.Character.prototype.equipWeapon = function(weapon)
{
    if (weapon instanceof Engine.assets.Weapon !== true) {
        throw new Error('Invalid weapon');
    }
    this.weapon = weapon;
    this.weapon.setUser(this);
}

Engine.assets.objects.Character.prototype.fire = function()
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

Engine.assets.objects.Character.prototype.getDeathObject = function()
{
    return new Engine.assets.decorations.TinyExplosion();
}

Engine.assets.objects.Character.prototype.jumpStart = function()
{
    if (this.stunnedTime > 0) {
        return false;
    }

    if (!this.isSupported) {
        return false;
    }
    this.isSupported = false;
    this.jumpInertia = this.inertia.y + this.jumpForce;
    this.jumpTime = this.time;
}

Engine.assets.objects.Character.prototype.jumpEnd = function()
{
    this.jumpInertia = 0;
}

Engine.assets.objects.Character.prototype.impactProjectile = function(projectile)
{
    if (projectile instanceof Engine.assets.Projectile !== true) {
        throw new Error('Invalid projectile');
    }

    if (this.inflictDamage(projectile.damage,
                           projectile.position.clone()
                               .sub(this.position))) {

        // Absorb projectile if not deadly hit.
        if (!this.health.isDepleted()) {
            this.scene.removeObject(projectile);
        }
    }
}

Engine.assets.objects.Character.prototype.inflictDamage = function(points, direction)
{
    if (this.isInvincible) {
        return false;
    }
    this.health.reduce(points);
    this.isInvincible = this.invincibilityDuration;
    this.stunnedTime = this.stunnedDuration;
    return true;
}

Engine.assets.objects.Character.prototype.moveLeftStart = function()
{
    this.walk--;
}

Engine.assets.objects.Character.prototype.moveLeftEnd = function()
{
    this.walk++;
}

Engine.assets.objects.Character.prototype.moveRightStart = function()
{
    this.walk++;
}

Engine.assets.objects.Character.prototype.moveRightEnd = function()
{
    this.walk--;
}

Engine.assets.objects.Character.prototype.setDirection = function(d)
{
    this.direction = d;
}

Engine.assets.objects.Character.prototype.timeShift = function(dt)
{
    this.isSupported = false;

    if (this.stunnedTime > 0) {
        this.stunnedTime -= dt;
    }
    else {
        this.momentum.set(0, 0);
        if (this.walk) {
            this.setDirection(this.walk > 0 ? this.RIGHT : this.LEFT);
        }
        this.calculateMoveSpeed(dt);
        this.momentum.x = (this.moveSpeed * this.walk);
    }

    if (this.isInvincible > 0) {
        this.isInvincible -= dt;
        this.model.visible = !this.model.visible;
    } else if (this.isInvincible < 0) {
        this.model.visible = true;
        this.isInvincible = false;
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

    if (this.health.isDepleted()) {
        var explosion = this.getDeathObject();
        explosion.model.position.copy(this.model.position);
        this.scene.addObject(explosion);
        this.scene.removeObject(this);
    }

    if (this.jumpInertia) {
        this.inertia.y = this.jumpInertia;
        if (this.time - this.jumpTime > this.jumpDuration) {
            this.jumpEnd();
        }
    }

    Engine.assets.Object.prototype.timeShift.call(this, dt);
}

Engine.assets.objects.characters = {};
