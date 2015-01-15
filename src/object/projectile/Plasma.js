Engine.assets.projectiles.Plasma = function()
{
    this.__proto__ = new Engine.assets.Projectile();
    var self = this;
    var model = Engine.Util.createSprite('projectile/plasma.gif', 8, 8);
    self.setModel(model);
    self.addCollisionZone(4, 0, 0);
    self.setDamage(10);
    self.setVelocity(240);
}
