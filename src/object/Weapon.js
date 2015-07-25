Engine.assets.Weapon = function()
{
    this.ammo = new Engine.assets.Energy();
    this.code = undefined;
    this.coolDown = 0;
    this.coolDownDelay = undefined;
    this.cost = 1;
    this.isReady = true;
    this.user = undefined;
}

Engine.assets.Weapon.prototype.emit = function(projectile, x, y)
{
    if (projectile instanceof Engine.assets.Projectile !== true) {
        throw new Error('Invalid projectile');
    }
    projectile.inertia.x = x * this.user.direction;
    projectile.inertia.y = y;
    projectile.setEmitter(this.user);
    projectile.timeStretch = this.user.timeStretch;
    this.user.scene.addObject(projectile);
}

Engine.assets.Weapon.prototype.fire = function()
{
    if (!this.isReady) {
        return false;
    }

    if (this.ammo.isFinite() && this.cost > 0) {
        if (this.ammo.getAmount() < this.cost) {
            return false;
        }
        this.ammo.reduce(this.cost);
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
