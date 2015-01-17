Engine.assets.Weapon = function()
{
    this.coolDownTimer;
    this.ammo = new Engine.assets.Energy();
    this.coolDown = 0;
    this.isReady = true;
    this.isFiring = false;
    this.projectileCost = 0;
    this.user = undefined;
}

Engine.assets.Weapon.prototype.fire = function()
{
    if (!this.isReady) {
        return false;
    }

    if (isFinite(this.ammo.value) && this.projectileCost !== 0) {
        if (this.ammo.value < this.projectileCost) {
            return false;
        }
        this.ammo.reduce(this.projectileCost);
    }

    if (this.coolDown > 0) {
        this.isReady = false;
        coolDownTimer = setTimeout(this.ready.bind(this), this.coolDown * 1000);
    }

    return true;
}

Engine.assets.Weapon.prototype.ready = function()
{
    this.isReady = true;
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

Engine.assets.weapons = {};
