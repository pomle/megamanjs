Engine.assets.objects.Character = function()
{
    Engine.assets.Object.call(this);

    this.fireTimeout = .25;
    this.direction = undefined;
    this.health = new Engine.assets.Energy(100);
    this.isFiring = false;
    this.isInvincible = false;
    this.invincibilityDuration = 0;
    this.mass = 1;
    this.isSupported = false;

    this.jumpForce = 155;
    this.jumpSpeed = 0;
    this.jumpTime = undefined;
    this.jumpDuration = .18;

    this.moveSpeed = 0;
    this.walkAcc = 500;
    this.walkSpeed = 90;
    this.walk = 0;
    this.weapon = undefined;
}

Engine.assets.objects.Character.prototype = Object.create(Engine.assets.Object.prototype);
Engine.assets.objects.Character.constructor = Engine.assets.objects.Character;

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
    if (!this.weapon) {
        return false;
    }

    if (!this.weapon.fire()) {
        return false;
    }

    this.isFiring = this.fireTimeout;

    return true;
}

Engine.assets.objects.Character.prototype.jumpStart = function()
{
    if (!this.isSupported) {
        //return false;
    }
    this.isSupported = false;
    this.jumpSpeed = this.jumpForce;
    this.jumpTime = this.time;
}

Engine.assets.objects.Character.prototype.jumpEnd = function()
{
    this.jumpSpeed = 0;
}

Engine.assets.objects.Character.prototype.inflictDamage = function(points)
{
    if (!this.isInvincible) {
        this.health.reduce(points);
        this.isInvincible = this.invincibilityDuration;
    }
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

Engine.assets.objects.Character.prototype.obstruct = function(solid, attack)
{
    if (solid instanceof Engine.assets.Solid === false) {
        throw new Error('Invalid solid');
    }

    switch (attack) {
        case solid.TOP:
            this.momentumSpeed.y = solid.speed.y;
            this.speed.x = solid.speed.x;
            this.isSupported = true;
            break;

        case solid.BOTTOM:
            this.momentumSpeed.y = solid.speed.y;
            this.jumpEnd();
            break;

        case solid.LEFT:
        case solid.RIGHT:
            this.moveSpeed = solid.speed.x;
            break;
    }
}

Engine.assets.objects.Character.prototype.setDirection = function(d)
{
    this.direction = d;
}

Engine.assets.objects.Character.prototype.timeShift = function(dt)
{
    this.calculateMoveSpeed(dt);

    this.momentumSpeed.x = (this.moveSpeed * this.walk);

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

    if (this.health.depleted()) {
        var explosion = new Engine.assets.decorations.Explosion();
        explosion.model.position.copy(this.model.position);
        this.scene.addObject(explosion);
        this.scene.removeObject(this);
    }

    if (this.jumpSpeed > 0) {
        this.momentumSpeed.y = Math.min(this.jumpSpeed, this.momentumSpeed.y + this.jumpSpeed);
        if (this.time - this.jumpTime > this.jumpDuration) {
            this.jumpEnd();
        }
    }


    Engine.assets.Object.prototype.timeShift.call(this, dt);

    /* Characters base speed is zero and calculated by the accumulative effects. */
    this.speed.x = 0;
    this.speed.y = 0;

    this.isSupported = false;
}

Engine.assets.objects.characters = {};
