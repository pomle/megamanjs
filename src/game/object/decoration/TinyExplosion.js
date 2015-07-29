Engine.assets.decorations.TinyExplosion = function()
{
    Engine.Object.call(this);

    var model = Engine.SpriteManager.createSprite('explosions.png', 16, 16);
    this.sprites = new Engine.SpriteManager(model, 16, 16 , 256, 256);

    var explosion = this.sprites.addSprite('explosion');
    explosion.addFrame(0,   192, .05);
    explosion.addFrame(16,  192, .05);
    explosion.addFrame(32,  192, .05);
    explosion.addFrame(48, 192, 1);

    this.sprites.selectSprite('explosion');
    this.sprites.applySprite();

    this.lifetime = explosion.timeline.totalDuration - .95;
    this.lifespan = 0;

    this.setModel(model);
}

Engine.assets.decorations.TinyExplosion.prototype = Object.create(Engine.assets.Decoration.prototype);
Engine.assets.decorations.TinyExplosion.constructor = Engine.assets.decorations.TinyExplosion;

Engine.assets.decorations.TinyExplosion.prototype.timeShift = function(dt)
{
    if (this.lifespan > this.lifetime) {
        this.scene.removeObject(this);
        return;
    }

    this.sprites.timeShift(dt);

    Engine.assets.Decoration.prototype.timeShift.call(this, dt);

    this.lifespan += dt;
}
