Game.objects.Weapon = function()
{
    Engine.Events.call(this);

    this.ammo = new Engine.logic.Energy(100);
    this.code = undefined;
    this.coolDown = 0;
    this.coolDownDelay = undefined;
    this.cost = 1;
    this.directions = [
        new THREE.Vector2(-1, 0),
        new THREE.Vector2(1, 0),
    ];
    this.isReady = true;
    this.user = undefined;

    this._lastAmmoAmount = undefined;
}

Engine.Util.mixin(Game.objects.Weapon, Engine.Events);

Game.objects.Weapon.prototype.EVENT_AMMO_CHANGED = 'ammo-changed';
Game.objects.Weapon.prototype.EVENT_READY = 'ready';

Game.objects.Weapon.prototype.emit = function(projectile)
{
    if (projectile instanceof Game.objects.Projectile === false) {
        throw new Error('Invalid projectile');
    }

    var user = this.user,
        direction = user.aim.clone();
    direction.clamp(this.directions[0], this.directions[1]);
    if (direction.x + direction.y == 0) {
        direction.x = user.direction.x;
    }

    projectile.velocity.copy(direction).setLength(projectile.speed);

    projectile.setEmitter(user, direction);
    projectile.timeStretch = user.timeStretch;

    user.world.addObject(projectile);
}

Game.objects.Weapon.prototype.fire = function()
{
    if (!this.isReady) {
        return false;
    }

    if (!this.ammo.infinite && this.cost > 0) {
        if (this.ammo.amount < this.cost) {
            return false;
        }
        this.ammo.amount -= this.cost;
        this.trigger(this.EVENT_AMMO_CHANGED);
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
    if (this._lastAmmoAmount !== this.ammo.amount) {
        this.trigger(this.EVENT_AMMO_CHANGED);
        this._lastAmmoAmount = this.ammo.amount;
    }

    if (this.coolDownDelay) {
        this.coolDownDelay -= dt;
        if (this.coolDownDelay <= 0) {
            this.isReady = true;
            this.trigger(this.EVENT_READY);
            this.coolDownDelay = undefined;
        }
    }
}

Game.objects.weapons = {};
