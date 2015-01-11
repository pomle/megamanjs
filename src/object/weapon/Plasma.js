Engine.assets.weapons.Plasma = function()
{
    Engine.assets.Weapon.call(this);
}

Engine.assets.weapons.Plasma.prototype = Object.create(Engine.assets.Weapon.prototype);
Engine.assets.weapons.Plasma.constructor = Engine.assets.Weapon;

Engine.assets.weapons.Plasma.prototype.fire = function()
{
    if (!Engine.assets.Weapon.prototype.fire.call(this)) {
        return false;
    }
    var projectile = new Engine.assets.projectiles.Plasma();
    projectile.setEmitter(this.user);
    projectile.speed.x = projectile.velocity * this.user.direction;
    this.user.scene.addObject(projectile);
    return true;
}
