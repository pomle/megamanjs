Game.objects.weapons.TimeStopper = function()
{
    Game.objects.Weapon.call(this);
    this.ammo.max = 30; // Seconds of real time it lasts.
    this.cost = 1;
    this.dilation = 0.01;
    this.dilated = false;
}

Game.objects.weapons.TimeStopper.prototype = Object.create(Game.objects.Weapon.prototype);
Game.objects.weapons.TimeStopper.constructor = Game.objects.Weapon;

Game.objects.weapons.TimeStopper.prototype.fire = function()
{
    if (!Game.objects.Weapon.prototype.fire.call(this)) {
        return false;
    }
    if (this.dilated) {
        this.resetTime();
    }
    else {
        this.distortTime();
    }
    return true;
}

Game.objects.weapons.TimeStopper.prototype.distortTime = function()
{
    this.user.world.timeStretch *= this.dilation;
    this.user.timeStretch /= this.dilation;
    this.dilated = true;
}

Game.objects.weapons.TimeStopper.prototype.resetTime = function()
{
    this.user.world.timeStretch /= this.dilation;
    this.user.timeStretch *= this.dilation;
    this.dilated = false;
}

Game.objects.weapons.TimeStopper.prototype.timeShift = function(dt)
{
    if (this.dilated) {
        this.ammo.amount -= this.cost * this.user.deltaTime;
        if (this.user.dead || this.ammo.depleted) {
            this.resetTime();
        }
    }
    Game.objects.Weapon.prototype.timeShift.apply(this, arguments);
}
