Engine.assets.objects.Character = function()
{
    Engine.assets.Object.call(this);

    this.fireTimer = undefined;
    this.jumpTimer = undefined;

    this.fireTimeout = .25;
    this.direction = undefined;
    this.health = new Engine.assets.Energy(100);
    this.isFiring = false;
    this.isSupported = false;
    this.jumpForce = 155;
    this.jumpSpeed = 0;
    this.jumpTimeout = .18;
    this.moveSpeed = 0;
    this.walkAcc = 15;
    this.walkSpeed = 90;
    this.walk = 0;
    this.weapon = undefined;

    this.setGravity(10);
}

Engine.assets.objects.Character.prototype = Object.create(Engine.assets.Object.prototype);
Engine.assets.objects.Character.constructor = Engine.assets.objects.Character;

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

    clearTimeout(this.fireTimer);
    this.isFiring = true;

    this.fireTimer = setTimeout(
        function stopFire() {
            this.isFiring = false;
        }.bind(this),
        this.fireTimeout * 1000);

    return true;
}

Engine.assets.objects.Character.prototype.jumpStart = function()
{
    if (this.speed.y) {
        return false;
    }
    this.jumpSpeed = this.jumpForce;
    this.jumpTimer = setTimeout(this.jumpEnd.bind(this), this.jumpTimeout * 1000);
    return this.jumpTimer;
}

Engine.assets.objects.Character.prototype.jumpEnd = function()
{
    this.jumpSpeed = 0;
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

Engine.assets.objects.Character.prototype.setFireTimeout = function(seconds)
{
    this.fireTimeout = seconds;
}

Engine.assets.objects.Character.prototype.setJumpForce = function(force)
{
    this.jumpForce = force;
}

Engine.assets.objects.Character.prototype.setWalkspeed = function(speed)
{
    this.walkSpeed = speed;
}

Engine.assets.objects.Character.prototype.timeShift = function(t)
{
    if (this.walk != 0) {
        this.moveSpeed = Math.min(this.moveSpeed + this.walkAcc, this.walkSpeed);
    }
    else {
        this.moveSpeed = 0;
    }
    this.speed.x = (this.moveSpeed * this.walk);
    if (this.jumpSpeed > 0) {
        this.speed.y = this.jumpSpeed;
    }

    if (!this.isSupported) {
        this.speed.y -= this.gravityForce;
    }

    if (this.speed.x || this.speed.y) {
        this.isSupported = false;
    }
    //console.log('Move Speed: %f', this.moveSpeed);
    //console.log('Jump Force: %f', this.jumpSpeed);
    Engine.assets.Object.prototype.timeShift.call(this, t);
}

Engine.assets.objects.characters = {};
