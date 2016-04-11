Game.objects.weapons.CrashBomber = function()
{
    Game.objects.Weapon.call(this);
}

Engine.Util.extend(Game.objects.weapons.CrashBomber,
                   Game.objects.Weapon);

Game.objects.weapons.CrashBomber.prototype.fire = function()
{
    if (!Game.objects.Weapon.prototype.fire.call(this)) {
        return false;
    }
    var projectile = this.getProjectile();
    this.emit(projectile);
    return true;
}
