Game.objects.weapons.AirShooter = function()
{
    Game.objects.Weapon.call(this);
    this.setCoolDown(1);
    this.ammo.max = 16;
}

Game.objects.weapons.AirShooter.prototype = Object.create(Game.objects.Weapon.prototype);
Game.objects.weapons.AirShooter.constructor = Game.objects.Weapon;

Game.objects.weapons.AirShooter.prototype.fire = function()
{
    if (!Game.objects.Weapon.prototype.fire.call(this)) {
        return false;
    }

    var projectiles = [
        new Game.objects.projectiles.AirShot(),
        new Game.objects.projectiles.AirShot(),
        new Game.objects.projectiles.AirShot(),
    ];

    var velocityMultiplier = 1.2;
    for (var i in projectiles) {
        this.emit(projectiles[i], projectiles[i].speed * Math.pow(velocityMultiplier, i), 0);
    }
    return true;
}
