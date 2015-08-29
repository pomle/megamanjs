Game.objects.weapons.EnemyPlasma = function()
{
    Game.objects.Weapon.call(this);
}

Engine.Util.extend(Game.objects.weapons.EnemyPlasma,
                   Game.objects.Weapon);

Game.objects.weapons.EnemyPlasma.prototype.fire = function()
{
    if (!Game.objects.Weapon.prototype.fire.call(this)) {
        return false;
    }
    var projectile = new Game.objects.projectiles.EnemyPlasma();
    this.emit(projectile);
    return true;
}
