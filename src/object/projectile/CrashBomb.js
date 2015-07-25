Engine.assets.projectiles.CrashBomb = function()
{
    Engine.assets.Projectile.call(this);

    var model = Engine.SpriteManager.createSprite('projectiles.png', 20, 16);
    this.sprites = new Engine.SpriteManager(model, 20, 16 , 128, 128);

    var flying = this.sprites.addSprite('flying');
    flying.addFrame(2, 20);

    var gripping = this.sprites.addSprite('gripping');
    gripping.addFrame(2, 36, .12);
    gripping.addFrame(2, 52);

    var ticking = this.sprites.addSprite('ticking');
    ticking.addFrame(2, 68, .12);
    ticking.addFrame(2, 52, .12);

    this.attachOffset = undefined;
    this.attachPosition = undefined;
    this.attachTime = false;

    this.setModel(model);
    this.addCollisionRect(8, 8, 0, -1);
    this.setDamage(20);
    this.setSpeed(240);
    this.penetratingForce = true;
    this.range = 200;

    this.explosion = new Engine.assets.decorations.Explosion();
}

Engine.assets.projectiles.CrashBomb.prototype = Object.create(Engine.assets.Projectile.prototype);
Engine.assets.projectiles.CrashBomb.constructor = Engine.assets.Projectile;

Engine.assets.projectiles.CrashBomb.prototype.collides = function(withObject, ourZone, theirZone)
{
    if (this.attachTime !== false) {
        return false;
    }

    if (withObject instanceof Engine.assets.Solid) {
        var our = new Engine.Collision.BoundingBox(this.model, ourZone);
        var their = new Engine.Collision.BoundingBox(withObject.model, theirZone);
        var dir = withObject.attackDirection(our, their);

        if (dir === withObject.TOP) {
            our.top(their.b);
        }
        else if (dir === withObject.BOTTOM) {
            our.bottom(their.t);
        }
        else {
            if (dir == withObject.LEFT) {
                our.left(their.r);
            } else if (dir == withObject.RIGHT) {
                our.right(their.l);
            }

            this.inertia.set(0, 0);
            this.attachPosition = withObject.position;
            this.attachOffset = this.position.clone().sub(this.attachPosition);
            this.attachTime = 0;
            this.dropCollision();
        }
    }

    Engine.assets.Projectile.prototype.collides.call(this, withObject, ourZone, theirZone);
}

Engine.assets.projectiles.CrashBomb.prototype.explode = function()
{
    this.explosion.model.position.copy(this.model.position);
    this.explosion.setEmitter(this.emitter);
    this.scene.addObject(this.explosion);
    this.scene.removeObject(this);
}

Engine.assets.projectiles.CrashBomb.prototype.rangeReached = function()
{
    this.explode();
}

Engine.assets.projectiles.CrashBomb.prototype.timeShift = function(dt)
{
    if (this.inertia.x) {
        this.sprites.setDirection(this.inertia.x > 0 ? 1 : -1);
    }

    if (this.attachTime === false) {
        this.sprites.selectSprite('flying');
    } else {
        if (this.attachTime > 2) {
            this.explode();
        }
        else if (this.attachTime > .25) {
            this.sprites.selectSprite('ticking');
        }
        else {
            this.sprites.selectSprite('gripping');
        }
        this.attachTime += dt;
    }

    this.sprites.timeShift(dt);

    Engine.assets.Projectile.prototype.timeShift.call(this, dt);

    if (this.attachPosition) {
        this.position.copy(this.attachPosition);
        this.position.add(this.attachOffset);
    }
}
