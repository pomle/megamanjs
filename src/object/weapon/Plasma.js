Engine.assets.weapons.Plasma = function()
{
    this.__proto__ = new Engine.assets.Weapon();
    var self = this;

    self.fire = function()
    {
        if (!self.__proto__.fire()) {
            return false;
        }
        var projectile = new Engine.assets.projectiles.Plasma();
        projectile.setEmitter(self.user);
        projectile.speed.x = projectile.velocity * self.user.direction;
        self.user.scene.addObject(projectile);
        return true;
    }
}
