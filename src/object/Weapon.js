Engine.assets.Weapon = function()
{
    this.ammo = new Engine.assets.Energy();
    this.coolDown = 0;
    this.coolDownDelay = undefined;
    this.isReady = true;
    this.projectileCost = 1;
    this.user = undefined;
}

Engine.assets.Weapon.prototype.fire = function()
{
    if (!this.isReady) {
        return false;
    }

    if (this.ammo.isFinite() && this.projectileCost > 0) {
        if (this.ammo.getAmount() < this.projectileCost) {
            return false;
        }
        this.ammo.reduce(this.projectileCost);
    }

    if (this.coolDown > 0) {
        this.isReady = false;
        this.coolDownDelay = this.coolDown;
    }

    return true;
}

Engine.assets.Weapon.prototype.setCoolDown = function(duration)
{
    this.coolDown = duration;
}

Engine.assets.Weapon.prototype.setUser = function(user)
{
    if (user instanceof Engine.assets.objects.Character !== true) {
        throw new Error('Invalid user');
    }
    this.user = user;
}

Engine.assets.Weapon.prototype.timeShift = function(dt)
{
    if (this.coolDownDelay) {
        this.coolDownDelay -= dt;
        if (this.coolDownDelay <= 0) {
            this.isReady = true;
            this.coolDownDelay = undefined;
        }
    }
}

Engine.assets.weapons = {};
