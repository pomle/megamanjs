Engine.assets.projectiles.MetalBlade = function()
{
    Engine.assets.Projectile.call(this);

    var model = Engine.Util.createSprite('projectiles.png', 16, 16);
    this.sprites = new Engine.SpriteManager(model, 16, 16 , 128, 128);

    var spinning = this.sprites.addSprite('spinning');
    spinning.addFrame(16, 0, .06);
    spinning.addFrame(32, 0, .06);
    this.sprites.selectSprite('spinning');
    this.sprites.applySprite();

    this.setModel(model);
    this.addCollisionZone(8, 0, 0);
    this.setDamage(20);
    this.setSpeed(240);
    this.penetratingForce = true;
    this.range = 600;
    this.rotationSpeed = 10;
}

Engine.assets.projectiles.MetalBlade.prototype = Object.create(Engine.assets.Projectile.prototype);
Engine.assets.projectiles.MetalBlade.constructor = Engine.assets.Projectile;


Engine.assets.projectiles.MetalBlade.prototype.timeShift = function(dt)
{
    this.sprites.timeShift(dt);
    Engine.assets.Projectile.prototype.timeShift.call(this, dt);
    //this.model.rotation.z += ((this.velocity.x > 0 ? this.rotationSpeed : -this.rotationSpeed) * dt);
}
