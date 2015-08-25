Game.objects.projectiles.CrashBomb = function()
{
    Game.objects.Projectile.call(this);

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
    this.setRange(200);

    this.explosion = new Game.objects.decorations.Explosion();
}

Game.objects.projectiles.CrashBomb.prototype = Object.create(Game.objects.Projectile.prototype);
Game.objects.projectiles.CrashBomb.constructor = Game.objects.Projectile;

Game.objects.projectiles.CrashBomb.prototype.collides = function(withObject, ourZone, theirZone)
{
    if (this.attachTime !== false) {
        return false;
    }

    if (withObject.solid) {
        var solid = withObject.solid;
        var our = new Engine.Collision.BoundingBox(this.model, ourZone);
        var their = new Engine.Collision.BoundingBox(withObject.model, theirZone);
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
            this.attachOffset = this.position.clone().sub(this.attachPosition);
            this.attachTime = 0;
            this.dropCollision();
        }
    }

    Game.objects.Projectile.prototype.collides.call(this, withObject, ourZone, theirZone);
}

Game.objects.projectiles.CrashBomb.prototype.explode = function()
{
    this.explosion.model.position.copy(this.model.position);
    this.explosion.setEmitter(this.emitter);
    this.world.addObject(this.explosion);
    this.world.removeObject(this);
}

Game.objects.projectiles.CrashBomb.prototype.rangeReached = function()
{
    this.explode();
}

Game.objects.projectiles.CrashBomb.prototype.timeShift = function(dt)
{
    if (this.velocity.x) {
        this.sprites.setDirection(this.velocity.x > 0 ? 1 : -1);
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

    Game.objects.Projectile.prototype.timeShift.call(this, dt);

    if (this.attachPosition) {
        this.position.copy(this.attachPosition);
        this.position.add(this.attachOffset);
    }
}
