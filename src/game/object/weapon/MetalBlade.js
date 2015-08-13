Game.objects.weapons.MetalBlade = function()
{
    Game.objects.Weapon.call(this);
    this.ammo.max = 84;
    this.directions = [
        new THREE.Vector2(-1, -1),
        new THREE.Vector2(1, 1),
    ];

}

Game.objects.weapons.MetalBlade.prototype = Object.create(Game.objects.Weapon.prototype);
Game.objects.weapons.MetalBlade.constructor = Game.objects.Weapon;

Game.objects.weapons.MetalBlade.prototype.fire = function()
{
    if (!Game.objects.Weapon.prototype.fire.call(this)) {
        return false;
    }
    var projectile = new Game.objects.projectiles.MetalBlade();
    this.emit(projectile, projectile.speed, 0)
    return true;
}
