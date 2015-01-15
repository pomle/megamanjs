Engine.assets.projectiles.MetalBlade = function()
{
    this.__proto__ = new Engine.assets.Projectile();
    var self = this;
    var model = Engine.Util.createSprite('projectile/metal-blade.gif', 16, 16);

    var sprite = new Engine.Sprite(model.material.map);
    sprite.addFrames([.1,.1]);
    sprite.play();

    self.setModel(model);
    self.addCollisionZone(8, 0, 0);
    self.setDamage(20);
    self.setVelocity(240);

    /*
    var rotationSpeed = 10;
    sprite.goTo(0);
    self.timeShift = function(t)
    {
        console.log(t, self.model.rotation.z);
        self.model.rotation.z += ((self.speed.x > 0 ? rotationSpeed : -rotationSpeed) * t);

    }*/
}
