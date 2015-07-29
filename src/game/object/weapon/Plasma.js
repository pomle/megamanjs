Engine.assets.weapons.Plasma = function()
{
    Engine.assets.Weapon.call(this);
    this.ammo.setInfinite();
}

Engine.assets.weapons.Plasma.prototype = Object.create(Engine.assets.Weapon.prototype);
Engine.assets.weapons.Plasma.constructor = Engine.assets.Weapon;

Engine.assets.weapons.Plasma.prototype.fire = function()
{
    if (!Engine.assets.Weapon.prototype.fire.call(this)) {
        return false;
    }
    var projectile = new Engine.assets.projectiles.Plasma();
    this.emit(projectile, projectile.speed, 0);
    return true;
}
