Engine.assets.weapons.AirShooter = function()
{
    Engine.assets.Weapon.call(this);
    this.setCoolDown(1);
    this.ammo.max = 16;
    this.ammo.finite(this.ammo.max);
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
    var projectile;
    for (var i in projectiles) {
        projectile = projectiles[i];
        projectile.setEmitter(this.user);
        projectile.inertia.x = projectile.velocity
                             * Math.pow(velocityMultiplier, i)
                             * this.user.direction;
        this.user.scene.addObject(projectile);
    }
    return true;
}
