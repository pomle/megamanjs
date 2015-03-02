Engine.assets.objects.Character = function()
{
    Engine.assets.Object.call(this);

    this.fireTimeout = .25;
    this.direction = undefined;
    this.health = new Engine.assets.Energy(100);
    this.isFiring = false;
    this.isInvincible = false;
    this.invincibilityDuration = 0;
    this.isSupported = false;

    this.jumpDuration = .18;
    this.jumpForce = 150;
    this.jumpInertia = 0;
    this.jumpTime = undefined;

    this.mass = 1;
    this.moveSpeed = 0;

    this.projectileEmitOffset = new THREE.Vector2();

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

Engine.assets.objects.Character.prototype.setDirection = function(d)
{
    this.direction = d;
}

Engine.assets.objects.Character.prototype.timeShift = function(dt)
{
    this.momentum.set(0, 0);

    this.calculateMoveSpeed(dt);

    this.momentum.x = (this.moveSpeed * this.walk);

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

    if (this.jumpInertia) {
        this.inertia.y = this.jumpInertia;
        if (this.time - this.jumpTime > this.jumpDuration) {
            this.jumpEnd();
        }
    }


    Engine.assets.Object.prototype.timeShift.call(this, dt);

    this.isSupported = false;
}

Engine.assets.objects.characters = {};
