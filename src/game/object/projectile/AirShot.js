Game.objects.projectiles.AirShot = function()
{
    Game.objects.Projectile.call(this);

    var model = Engine.SpriteManager.createSprite('projectiles.png', 16, 16);
    this.sprites = new Engine.SpriteManager(model, 16, 16 , 128, 128);

    var twirling = this.sprites.addSprite('twirling');
    twirling.addFrame(48, 0, .06);
    twirling.addFrame(64, 0, .06);
    twirling.addFrame(80, 0, .06);

    this.sprites.selectSprite('twirling');
    this.sprites.applySprite();

    this.setModel(model);
    this.setDamage(20);
    this.setSpeed(80);
    this.penetratingForce = true;
    this.addCollisionRect(7, 8, 0, 0);
}

Game.objects.projectiles.AirShot.prototype = Object.create(Game.objects.Projectile.prototype);
Game.objects.projectiles.AirShot.constructor = Game.objects.Projectile;

Game.objects.projectiles.AirShot.prototype.timeShift = function(dt)
{
    if (this.velocity.x) {
        this.sprites.setDirection(this.velocity.x > 0 ? 1 : -1);
    }
    this.physics.inertia.y += 150 * dt;

    this.sprites.timeShift(dt);
    Game.objects.Projectile.prototype.timeShift.call(this, dt);
}
