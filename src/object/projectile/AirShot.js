Engine.assets.projectiles.AirShot = function()
{
    Engine.assets.Projectile.call(this);

    var model = Engine.Util.createSprite('projectiles.png', 16, 16);
    this.sprites = new Engine.SpriteManager(model, 16, 16 , 128, 128);

    var twirling = this.sprites.addSprite('twirling');
    twirling.addFrame(48, 0, .06);
    twirling.addFrame(64, 0, .06);
    twirling.addFrame(80, 0, .06);

    this.sprites.selectSprite('twirling');
    this.sprites.applySprite();

    this.setDamage(20);
    this.setModel(model);
    this.setVelocity(80);

    this.addCollisionRect(7, 8, 0, 0);
}

Engine.assets.projectiles.AirShot.prototype = Object.create(Engine.assets.Projectile.prototype);
Engine.assets.projectiles.AirShot.constructor = Engine.assets.Projectile;

Engine.assets.projectiles.AirShot.prototype.timeShift = function(dt)
{
    if (this.inertia.x) {
        this.sprites.setDirection(this.inertia.x > 0 ? 1 : -1);
    }
    this.inertia.y += 150 * dt;

    this.sprites.timeShift(dt);
    Engine.assets.Projectile.prototype.timeShift.call(this, dt);
}
