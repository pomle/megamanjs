Engine.assets.weapons.EnemyPlasma = function()
{
    Engine.assets.Weapon.call(this);
}

Engine.assets.weapons.EnemyPlasma.prototype = Object.create(Engine.assets.Weapon.prototype);
Engine.assets.weapons.EnemyPlasma.constructor = Engine.assets.Weapon;

Engine.assets.weapons.EnemyPlasma.prototype.fire = function()
{
    if (!Engine.assets.Weapon.prototype.fire.call(this)) {
        return false;
    }
    var projectile = new Engine.assets.projectiles.EnemyPlasma();
    projectile.setEmitter(this.user);
    projectile.inertia.x = projectile.speed * this.user.direction;
    this.user.scene.addObject(projectile);
    return true;
}
