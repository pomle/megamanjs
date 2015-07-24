Engine.assets.weapons.TimeStopper = function()
{
    Engine.assets.Weapon.call(this);
    this.ammo.setMax(30); // Seconds of real time it lasts.
    this.cost = 1;
    this.timeFraction = 0.01;
    this.timeDistorted = false;
}

Engine.assets.weapons.TimeStopper.prototype = Object.create(Engine.assets.Weapon.prototype);
Engine.assets.weapons.TimeStopper.constructor = Engine.assets.Weapon;

Engine.assets.weapons.TimeStopper.prototype.fire = function()
{
    if (!Engine.assets.Weapon.prototype.fire.call(this)) {
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

Engine.assets.weapons.TimeStopper.prototype.distortTime = function()
{
    this.user.scene.timeStretch *= this.timeFraction;
    this.user.timeStretch /= this.timeFraction;
    this.timeDistorted = true;
}

Engine.assets.weapons.TimeStopper.prototype.resetTime = function()
{
    this.user.scene.timeStretch /= this.timeFraction;
    this.user.timeStretch *= this.timeFraction;
    this.timeDistorted = false;
}


Engine.assets.weapons.TimeStopper.prototype.timeShift = function(dt)
{
    if (this.timeDistorted) {
        this.ammo.reduce(this.cost * this.user.deltaTime);
        if (this.user.dead || this.ammo.isDepleted()) {
            this.resetTime();
        }
    }
    Engine.assets.Weapon.prototype.timeShift.apply(this, arguments);
}
