Game.objects.weapons.TimeStopper = function()
{
    Game.objects.Weapon.call(this);
    this.ammo.setMax(30); // Seconds of real time it lasts.
    this.cost = 1;
    this.timeFraction = 0.01;
    this.timeDistorted = false;
}

Game.objects.weapons.TimeStopper.prototype = Object.create(Game.objects.Weapon.prototype);
Game.objects.weapons.TimeStopper.constructor = Game.objects.Weapon;

Game.objects.weapons.TimeStopper.prototype.fire = function()
{
    if (!Game.objects.Weapon.prototype.fire.call(this)) {
        return false;
    }
    if (this.timeDistorted) {
        this.resetTime();
    }
    else {
        this.distortTime();
    }
    return true;
}

Game.objects.weapons.TimeStopper.prototype.distortTime = function()
{
    this.user.world.timeStretch *= this.timeFraction;
    this.user.timeStretch /= this.timeFraction;
    this.timeDistorted = true;
}

Game.objects.weapons.TimeStopper.prototype.resetTime = function()
{
    this.user.world.timeStretch /= this.timeFraction;
    this.user.timeStretch *= this.timeFraction;
    this.timeDistorted = false;
}


Game.objects.weapons.TimeStopper.prototype.timeShift = function(dt)
{
    if (this.timeDistorted) {
        this.ammo.reduce(this.cost * this.user.deltaTime);
        if (this.user.dead || this.ammo.isDepleted()) {
            this.resetTime();
        }
    }
    Game.objects.Weapon.prototype.timeShift.apply(this, arguments);
}
