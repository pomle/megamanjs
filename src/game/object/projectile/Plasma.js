Game.objects.projectiles.Plasma = function()
{
    Game.objects.Projectile.call(this);
    this.setDamage(3);
    this.setSpeed(240);
}

Engine.Util.extend(Game.objects.projectiles.Plasma,
                   Game.objects.Projectile);
