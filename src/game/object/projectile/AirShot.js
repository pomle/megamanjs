Game.objects.projectiles.AirShot = function()
{
    Game.objects.Projectile.call(this);

    this.setDamage(20);
    this.setRange(150);
    this.setSpeed(80);
    this.penetratingForce = true;
    this.addCollisionRect(7, 8, 0, 0);
}

Game.objects.projectiles.AirShot.prototype = Object.create(Game.objects.Projectile.prototype);
Game.objects.projectiles.AirShot.constructor = Game.objects.Projectile;

Game.objects.projectiles.AirShot.prototype.timeShift = function(dt)
{
    if (this.velocity.x) {
        this.direction.x = this.velocity.x > 0 ? 1 : -1;
    }
    this.velocity.y += 150 * dt;
    Game.objects.Projectile.prototype.timeShift.call(this, dt);
}
