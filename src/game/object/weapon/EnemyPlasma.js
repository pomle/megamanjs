Game.objects.weapons.EnemyPlasma = function()
{
    Game.objects.Weapon.call(this);
    this.addProjectile(new Game.objects.projectiles.EnemyPlasma());
}

Engine.Util.extend(Game.objects.weapons.EnemyPlasma,
                   Game.objects.Weapon);

Game.objects.weapons.EnemyPlasma.prototype.fire = function()
{
    if (!Game.objects.Weapon.prototype.fire.call(this)) {
        return false;
    }
    this.emit(this.getProjectile());
    return true;
}
