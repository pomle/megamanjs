Game.objects.weapons.CrashBomber = function()
{
    Game.objects.Weapon.call(this);
    this.setCoolDown(1);
    this.ammo.setMax(8);
}

Game.objects.weapons.CrashBomber.prototype = Object.create(Game.objects.Weapon.prototype);
Game.objects.weapons.CrashBomber.constructor = Game.objects.Weapon;

Game.objects.weapons.CrashBomber.prototype.fire = function()
{
    if (!Game.objects.Weapon.prototype.fire.call(this)) {
        return false;
    }
    var projectile = new Game.objects.projectiles.CrashBomb();
    this.emit(projectile, projectile.speed, 0);
    return true;
}
