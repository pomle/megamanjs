Engine.assets.projectiles.CrashBomb = function()
{
    Engine.assets.Projectile.call(this);

    var model = Engine.Util.createSprite('projectile/tiles.gif', 20, 16);
    this.sprites = new Engine.SpriteManager(model, 20, 16 , 128, 128);

    var flying = this.sprites.addSprite('flying');
    flying.addFrame(2, 20);

    var gripping = this.sprites.addSprite('gripping');
    gripping.addFrame(2, 36, .12);
    gripping.addFrame(2, 52);

    var ticking = this.sprites.addSprite('ticking');
    ticking.addFrame(2, 68, .12);
    ticking.addFrame(2, 52, .12);


    this.setModel(model);
    this.addCollisionZone(4, 0, -1);
    this.setDamage(20);
    this.setVelocity(240);

    this.isAttached = false;
}

Engine.assets.projectiles.CrashBomb.prototype = Object.create(Engine.assets.Projectile.prototype);
Engine.assets.projectiles.CrashBomb.constructor = Engine.assets.Projectile;

Engine.assets.projectiles.CrashBomb.prototype.collides = function(withObject, ourZone, theirZone)
{
    if (withObject instanceof Engine.assets.Solid) {
        this.speed = withObject.speed;
        this.isAttached = 0;
        this.dropCollision();
    }

    Engine.assets.Projectile.prototype.collides.call(this, withObject, ourZone, theirZone);
}

Engine.assets.projectiles.CrashBomb.prototype.timeShift = function(dt)
{
    if (this.speed.x) {
        this.sprites.setDirection(this.speed.x > 0 ? 1 : -1);
    }

    if (this.isAttached === false) {
        this.sprites.selectSprite('flying');
    } else {
        if (this.isAttached > 2) {
            var explosion = new Engine.assets.decorations.Explosion();
            explosion.model.position.copy(this.model.position);
            this.scene.addObject(explosion);
            this.scene.removeObject(this);
        }
        else if (this.isAttached > .25) {
            this.sprites.selectSprite('ticking');
        }
        else {
            this.sprites.selectSprite('gripping');
        }
        this.isAttached += dt;
    }

    this.sprites.timeShift(dt);

    Engine.assets.Projectile.prototype.timeShift.call(this, dt);
}
