Engine.assets.weapons.MetalBlade = function()
{
    Engine.assets.Weapon.call(this);
    this.ammo.setMax(84);
}

Engine.assets.weapons.MetalBlade.prototype = Object.create(Engine.assets.Weapon.prototype);
Engine.assets.weapons.MetalBlade.constructor = Engine.assets.Weapon;

Engine.assets.weapons.MetalBlade.prototype.fire = function()
{
    if (!Engine.assets.Weapon.prototype.fire.call(this)) {
        return false;
    }
    var projectile = new Engine.assets.projectiles.MetalBlade();
    this.emit(projectile, projectile.speed, 0)
    return true;
}
