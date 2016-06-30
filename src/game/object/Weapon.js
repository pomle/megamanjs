Game.objects.Weapon = function()
{
    this._coolDownDelay = undefined;

    this.ammo = new Engine.logic.Energy(100);
    this.code = undefined;
    this.coolDown = 0;
    this.cost = 1;
    this.directions = [
        new THREE.Vector2(-1, 0),
        new THREE.Vector2(1, 0),
    ];
    this.events = new Engine.Events(this);
    this.projectiles = [];
    this.projectilesFired = [];
    this.projectilesIdle = [];
    this.ready = true;
    this.user = undefined;

    this.ammo.events.bind(this.ammo.EVENT_CHANGE, () => {
        this.events.trigger(this.EVENT_AMMO_CHANGED, [this]);
    });
}

Game.objects.Weapon.prototype.EVENT_AMMO_CHANGED = 'ammo-changed';
Game.objects.Weapon.prototype.EVENT_READY = 'ready';

Game.objects.Weapon.prototype.addProjectile = function(object)
{
    if (!(object instanceof Engine.Object) || !object.projectile) {
        throw new TypeError('Invalid projectile');
    }
    this.projectiles.push(object);
    this.projectilesIdle.push(object);
    object.events.bind(object.projectile.EVENT_RECYCLE, this.recycleProjectile.bind(this));
}

Game.objects.Weapon.prototype.emit = function(object)
{
    if (!(object instanceof Engine.Object) || !object.projectile) {
        throw new TypeError('Invalid projectile');
    }

    const projectile = object.projectile;
    const user = this.user;
    const weapon = user.weapon;
    const aim = user.aim.clone();
    aim.clamp(this.directions[0], this.directions[1]);

    // If not explicitly aiming, infer x direction from user.
    if (aim.x === 0 && aim.y === 0) {
        aim.x = user.direction.x;
    }

    object.velocity.copy(aim).setLength(projectile.speed);
    object.setEmitter(user);

    const origin = user.position.clone();
    origin.x += weapon.projectileEmitOffset.x * aim.x;
    origin.y += weapon.projectileEmitOffset.y;
    const radius = aim.clone().setLength(weapon.projectileEmitRadius);
    origin.add(radius);
    projectile.setOrigin(origin);

    object.timeStretch = user.timeStretch;

    var index = this.projectilesIdle.indexOf(object);
    if (index !== -1) {
        this.projectilesIdle.splice(index, 1);
        this.projectilesFired.push(object);
    }

    user.world.addObject(object);
}

Game.objects.Weapon.prototype.fire = function()
{
    if (!this.ready) {
        return false;
    }

    if (this.projectiles.length > 0 && this.projectilesIdle.length === 0) {
        return false;
    }

    if (!this.user.world) {
        return false;
    }

    if (!this.ammo.infinite && this.cost > 0) {
        if (this.ammo.amount < this.cost) {
            return false;
        }
        this.ammo.amount -= this.cost;
    }

    if (this.coolDown > 0) {
        this.ready = false;
        this._coolDownDelay = this.coolDown;
    }

    return true;
}

Game.objects.Weapon.prototype.getProjectile = function()
{
    return this.projectilesIdle[0];
}

Game.objects.Weapon.prototype.recycleProjectile = function(projectile)
{
    var index = this.projectilesFired.indexOf(projectile);
    if (index !== -1) {
        this.projectilesFired.splice(index, 1);
        this.projectilesIdle.push(projectile);
        projectile.world.removeObject(projectile);
    }
}

Game.objects.Weapon.prototype.setCoolDown = function(duration)
{
    this.coolDown = duration;
}

Game.objects.Weapon.prototype.setUser = function(user)
{
    if (user instanceof Game.objects.Character !== true) {
        throw new TypeError('User not character');
    }
    if (user.weapon instanceof Game.traits.Weapon !== true) {
        throw new TypeError('User missing weapon trait');
    }
    this.user = user;
}

Game.objects.Weapon.prototype.timeShift = function(dt)
{
    if (this._coolDownDelay !== undefined) {
        this._coolDownDelay -= dt;
        if (this._coolDownDelay <= 0) {
            this.ready = true;
            this.events.trigger(this.EVENT_READY);
            this._coolDownDelay = undefined;
        }
    }
}

Game.objects.weapons = {};
