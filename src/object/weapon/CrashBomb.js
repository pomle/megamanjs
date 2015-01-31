Engine.assets.weapons.CrashBomb = function()
{
    Engine.assets.Weapon.call(this);
    this.setCoolDown(1);
}

Engine.assets.weapons.CrashBomb.prototype = Object.create(Engine.assets.Weapon.prototype);
Engine.assets.weapons.CrashBomb.constructor = Engine.assets.Weapon;

Engine.assets.weapons.CrashBomb.prototype.fire = function()
{
    if (!Engine.assets.Weapon.prototype.fire.call(this)) {
        return false;
    }
    var projectile = new Engine.assets.projectiles.CrashBomb();
    projectile.setEmitter(this.user);
    projectile.speed.x = projectile.velocity * this.user.direction;
    this.user.scene.addObject(projectile);
    return true;
}
