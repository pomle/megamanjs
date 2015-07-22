Engine.assets.weapons.AirShooter = function()
{
    Engine.assets.Weapon.call(this);
    this.setCoolDown(1);
    this.ammo.setMax(16);
}

Engine.assets.weapons.AirShooter.prototype = Object.create(Engine.assets.Weapon.prototype);
Engine.assets.weapons.AirShooter.constructor = Engine.assets.Weapon;

Engine.assets.weapons.AirShooter.prototype.fire = function()
{
    if (!Engine.assets.Weapon.prototype.fire.call(this)) {
        return false;
    }

    var projectiles = [
        new Engine.assets.projectiles.AirShot(),
        new Engine.assets.projectiles.AirShot(),
        new Engine.assets.projectiles.AirShot(),
    ];

    var velocityMultiplier = 1.2;
    for (var i in projectiles) {
        this.emit(projectiles[i], projectiles[i].speed * Math.pow(velocityMultiplier, i), 0);
    }
    return true;
}
