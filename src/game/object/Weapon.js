Game.objects.Weapon = function()
{
    this.ammo = new Game.objects.Energy();
    this.code = undefined;
    this.coolDown = 0;
    this.coolDownDelay = undefined;
    this.cost = 1;
    this.isReady = true;
    this.user = undefined;
}

Game.objects.Weapon.prototype.emit = function(projectile, x, y)
{
    if (projectile instanceof Game.objects.Projectile !== true) {
        throw new Error('Invalid projectile');
    }
    projectile.physics.inertia.x = x * this.user.direction;
    projectile.physics.inertia.y = y;
    projectile.setEmitter(this.user);
    projectile.timeStretch = this.user.timeStretch;
    this.user.world.addObject(projectile);
}

Game.objects.Weapon.prototype.fire = function()
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

Game.objects.Weapon.prototype.setCoolDown = function(duration)
{
    this.coolDown = duration;
}

Game.objects.Weapon.prototype.setUser = function(user)
{
    if (user instanceof Game.objects.Character !== true) {
        throw new Error('Invalid user');
    }
    this.user = user;
}

Game.objects.Weapon.prototype.timeShift = function(dt)
{
    if (this.coolDownDelay) {
        this.coolDownDelay -= dt;
        if (this.coolDownDelay <= 0) {
            this.isReady = true;
            this.coolDownDelay = undefined;
        }
    }
}

Game.objects.weapons = {};
