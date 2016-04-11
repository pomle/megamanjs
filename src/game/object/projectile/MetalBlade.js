Game.objects.projectiles.MetalBlade = function()
{
    Game.objects.Projectile.call(this);
    this.setDamage(20);
    this.setSpeed(240);
    this.penetratingForce = true;
    this.range = 600;
    this.rotationSpeed = 10;
}

Engine.Util.extend(Game.objects.projectiles.MetalBlade,
                   Game.objects.Projectile);
