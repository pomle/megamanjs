Game.objects.weapons.Plasma = function()
{
    Game.objects.Weapon.call(this);
    this.ammo.infinite = true;

    for (var i = 0; i < 3; ++i) {
        this.addProjectile(new Game.objects.projectiles.Plasma());
    }
}

Game.objects.weapons.Plasma.prototype = Object.create(Game.objects.Weapon.prototype);
Game.objects.weapons.Plasma.constructor = Game.objects.Weapon;

Game.objects.weapons.Plasma.prototype.fire = function()
{
    if (!Game.objects.Weapon.prototype.fire.call(this)) {
        return false;
    }

    this.emit(this.projectilesIdle[0]);
    return true;
}
