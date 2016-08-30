Engine.objects.Weapon = class Weapon
{
    constructor()
    {
        this.EVENT_AMMO_CHANGED = 'ammo-changed';
        this.EVENT_READY = 'ready';

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
    addProjectile(object)
    {
        if (!(object instanceof Engine.Object) || !object.projectile) {
            throw new TypeError('Invalid projectile');
        }
        this.projectiles.push(object);
        this.projectilesIdle.push(object);
        object.events.bind(object.projectile.EVENT_RECYCLED, this.recycleProjectile.bind(this));
    }
    emit(object)
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

        projectile.setDirection(aim);
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
    fire()
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
    getProjectile()
    {
        return this.projectilesIdle[0];
    }
    recycleProjectile(projectile)
    {
        const index = this.projectilesFired.indexOf(projectile);
        if (index !== -1) {
            this.projectilesFired.splice(index, 1);
            this.projectilesIdle.push(projectile);
            projectile.world.removeObject(projectile);
        }
    }
    setCoolDown(duration)
    {
        this.coolDown = duration;
    }
    setUser(user)
    {
        if (user instanceof Engine.Object !== true) {
            throw new TypeError('User not object');
        }
        if (user.weapon instanceof Engine.traits.Weapon !== true) {
            throw new TypeError('User missing weapon trait');
        }
        this.user = user;
    }
    timeShift(dt)
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
}

Engine.objects.weapons = {};
