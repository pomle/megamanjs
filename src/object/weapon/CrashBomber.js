Engine.assets.weapons.CrashBomber = function()
{
    Engine.assets.Weapon.call(this);
    this.setCoolDown(1);
    this.ammo.setMax(8);
}

Engine.assets.weapons.CrashBomber.prototype = Object.create(Engine.assets.Weapon.prototype);
Engine.assets.weapons.CrashBomber.constructor = Engine.assets.Weapon;

Engine.assets.weapons.CrashBomber.prototype.fire = function()
{
    if (!Engine.assets.Weapon.prototype.fire.call(this)) {
        return false;
    }
    var projectile = new Engine.assets.projectiles.CrashBomb();
    projectile.setEmitter(this.user);
    projectile.inertia.x = projectile.speed * this.user.direction;
    this.user.scene.addObject(projectile);
    return true;
}
