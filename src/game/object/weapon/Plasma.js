Game.objects.weapons.Plasma = function()
{
    Game.objects.Weapon.call(this);
    this.ammo.infinite = true;
}

Game.objects.weapons.Plasma.prototype = Object.create(Game.objects.Weapon.prototype);
Game.objects.weapons.Plasma.constructor = Game.objects.Weapon;

Game.objects.weapons.Plasma.prototype.fire = function()
{
    if (!Game.objects.Weapon.prototype.fire.call(this)) {
        return false;
    }
    var projectile = new Game.objects.projectiles.Plasma();
    this.emit(projectile);
    return true;
}
