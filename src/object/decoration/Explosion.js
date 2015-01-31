Engine.assets.decorations.Explosion = function()
{
    Engine.assets.Object.call(this);

    var model = Engine.Util.createSprite('explosions.gif', 48, 48);
    this.sprites = new Engine.SpriteManager(model, 48, 48 , 256, 256);

    var explosion = this.sprites.addSprite('explosion');
    var d = .06;
    explosion.addFrame(0,   0, d);
    explosion.addFrame(48,  0, d);
    explosion.addFrame(96,  0, d);

    explosion.addFrame(0,  48, d);
    explosion.addFrame(48, 48, d);
    explosion.addFrame(96, 48, d);

    explosion.addFrame(0,  96, d);
    explosion.addFrame(48, 96, d);
    explosion.addFrame(96, 96, d);

    explosion.addFrame(0,  144, d);
    explosion.addFrame(48, 144, d);
    explosion.addFrame(96, 144, d);
    explosion.addFrame(144, 144, d);

    this.sprites.applySprite('explosion');

    this.damage = 50;
    this.lifetime = d * 12;
    this.lifespan = 0;

    this.setModel(model);

    this.addCollisionZone(22)
}

Engine.assets.decorations.Explosion.prototype = Object.create(Engine.assets.Decoration.prototype);
Engine.assets.decorations.Explosion.constructor = Engine.assets.decorations.Explosion;

Engine.assets.decorations.Explosion.prototype.collides = function(withObject, ourZone, theirZone)
{
    if (withObject.health) {
        withObject.health.reduce(this.damage);
    }
}

Engine.assets.decorations.Explosion.prototype.timeShift = function(dt)
{
    if (this.lifespan > this.lifetime) {
        this.scene.removeObject(this);
        return;
    }

    this.sprites.timeShift(dt);

    Engine.assets.Decoration.prototype.timeShift.call(this, dt);

    this.lifespan += dt;
}
