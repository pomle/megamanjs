Game.objects.weapons.EnemyPlasma = function()
{
    Game.objects.Weapon.call(this);
}

Game.objects.weapons.EnemyPlasma.prototype = Object.create(Game.objects.Weapon.prototype);
Game.objects.weapons.EnemyPlasma.constructor = Game.objects.Weapon;

Game.objects.weapons.EnemyPlasma.prototype.fire = function()
{
    if (!Game.objects.Weapon.prototype.fire.call(this)) {
        return false;
    }
    var projectile = new Game.objects.projectiles.EnemyPlasma();
    this.emit(projectile, projectile.speed);
    return true;
}
