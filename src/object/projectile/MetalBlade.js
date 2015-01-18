Engine.assets.projectiles.MetalBlade = function()
{
    Engine.assets.Projectile.call(this);

    var model = Engine.Util.createSprite('projectile/metal-blade.gif', 16, 16);
    var sprite = new Engine.Sprite(model.material.map);

    sprite.addFrames([.1,.1]);
    sprite.play();

    this.setModel(model);
    this.addCollisionZone(8, 0, 0);
    this.setDamage(20);
    this.setVelocity(240);

    this.rotationSpeed = 10;
}

Engine.assets.projectiles.MetalBlade.prototype = Object.create(Engine.assets.Projectile.prototype);
Engine.assets.projectiles.MetalBlade.constructor = Engine.assets.Projectile;

/*
Engine.assets.projectiles.MetalBlade.prototype.timeShift = function(t)
{
    Engine.assets.Projectile.prototype.timeShift.call(this, t);
    this.model.rotation.z += ((this.speed.x > 0 ? this.rotationSpeed : -this.rotationSpeed) * t);
}
*/
