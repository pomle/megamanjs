Engine.assets.weapons.MetalBlade = function()
{
    Engine.assets.Weapon.call(this);
    this.ammo.max = 84;
    this.ammo.finite(this.ammo.max);
}

Engine.assets.weapons.MetalBlade.prototype = Object.create(Engine.assets.Weapon.prototype);
Engine.assets.weapons.MetalBlade.constructor = Engine.assets.Weapon;

Engine.assets.weapons.MetalBlade.prototype.fire = function()
{
    if (!Engine.assets.Weapon.prototype.fire.call(this)) {
        return false;
    }
    var projectile = new Engine.assets.projectiles.MetalBlade();
    projectile.setEmitter(this.user);
    projectile.momentumSpeed.x = projectile.velocity * this.user.direction;
    this.user.scene.addObject(projectile);
    return true;
}
