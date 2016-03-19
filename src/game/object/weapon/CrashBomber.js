Game.objects.weapons.CrashBomber = function()
{
    Game.objects.Weapon.call(this);
    this.setCoolDown(1);
    this.ammo.max = 8;
    this.addProjectile(new Game.objects.projectiles.CrashBomb());
}

Game.objects.weapons.CrashBomber.prototype = Object.create(Game.objects.Weapon.prototype);
Game.objects.weapons.CrashBomber.constructor = Game.objects.Weapon;

Game.objects.weapons.CrashBomber.prototype.fire = function()
{
    if (!Game.objects.Weapon.prototype.fire.call(this)) {
        return false;
    }
    var projectile = this.getProjectile();
    this.emit(projectile);
    return true;
}
