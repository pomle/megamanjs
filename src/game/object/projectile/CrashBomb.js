Game.objects.projectiles.CrashBomb = function()
{
    Game.objects.Projectile.call(this);

    this.attachOffset = new THREE.Vector3();
    this.attachPosition = undefined;
    this.attachTime = -1;
    this._lifetimeLast = undefined;

    this.setDamage(20);
    this.setSpeed(240);
    this.penetratingForce = true;
    this.setRange(200);

    //this.explosion = new Game.objects.decorations.Explosion();
}

Engine.Util.extend(Game.objects.projectiles.CrashBomb,
                   Game.objects.Projectile);

Game.objects.projectiles.CrashBomb.prototype.collides = function(withObject, ourZone, theirZone)
{
    if (this.attachTime !== -1) {
        return false;
    }

    if (withObject.solid) {
        var solid = withObject.solid;
        var our = new Engine.Collision.BoundingBox(this, ourZone);
        var their = new Engine.Collision.BoundingBox(withObject, theirZone);
        var dir = solid.attackDirection(our, their);

        /* If we are pushing Crash Bomb from the top or below, just nudge. */
        if (dir === solid.TOP) {
            our.top = their.bottom;
        }
        else if (dir === solid.BOTTOM) {
            our.bottom = their.top;
        }
        /* If we hit something from left or right, we attach. */
        else {
            if (dir == solid.LEFT) {
                our.left = their.right;
            } else if (dir == solid.RIGHT) {
                our.right = their.left;
            }

            this.velocity.multiplyScalar(0);
            this.attachPosition = withObject.position;
            this.attachOffset.copy(this.position).sub(this.attachPosition);
            this.attachTime = 0;

            /* Prefer attach timer to lifetime timer. */
            this.collidable = false;
            this.lifetime = Infinity;
        }
    }

    Game.objects.Projectile.prototype.collides.call(this, withObject, ourZone, theirZone);
}

Game.objects.projectiles.CrashBomb.prototype.explode = function()
{
    /*this.explosion.position.copy(this.position);
    this.explosion.setEmitter(this.emitter);
    this.world.addObject(this.explosion);*/
    this.recycle();
}

Game.objects.projectiles.CrashBomb.prototype.recycle = function()
{
    Game.objects.Projectile.prototype.recycle.call(this);
    this.attachTime = -1;
    this.attachPosition = undefined;
    this.lifetime = this.getLifetime();
}

Game.objects.projectiles.CrashBomb.prototype.rangeReached = function()
{
    this.explode();
}

Game.objects.projectiles.CrashBomb.prototype.timeShift = function(dt)
{
    if (this.velocity.x) {
        this.direction.x = this.velocity.x > 0 ? 1 : -1;
    }

    if (this.attachTime === -1) {
        this.setAnimation('flying');
    } else {
        this.attachTime += dt;
        if (this.attachTime > 2) {
            this.explode();
        } else if (this.attachTime > .25) {
            this.setAnimation('ticking');
        } else {
            this.setAnimation('gripping');
        }
    }

    Game.objects.Projectile.prototype.timeShift.call(this, dt);

    if (this.attachTime !== -1) {
        this.position.copy(this.attachPosition);
        this.position.add(this.attachOffset);
    }
}
