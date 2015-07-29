Game.objects.decorations.Explosion = function()
{
    Engine.Object.call(this);

    var model = Engine.SpriteManager.createSprite('explosions.png', 48, 48);
    this.sprites = new Engine.SpriteManager(model, 48, 48 , 256, 256);

    var explosion = this.sprites.addSprite('explosion');
    for (var i = 1; i <= 2; i++) {
        explosion.addFrame(0,   0, .05);
        explosion.addFrame(48,  0, .05);
        explosion.addFrame(96,  0, .0333);

        explosion.addFrame(0,  48, .05);
        explosion.addFrame(48, 48, .05);
        explosion.addFrame(96, 48, .0333);

        explosion.addFrame(0,  96, .05);
        explosion.addFrame(48, 96, .05);
        explosion.addFrame(96, 96, .0333);

        explosion.addFrame(0,  144, .05);
        explosion.addFrame(48, 144, .05);
        explosion.addFrame(96, 144, .0333);
    }
    explosion.addFrame(144, 144, 1);

    this.sprites.selectSprite('explosion');
    this.sprites.applySprite();

    this.damage = 25;
    this.lifetime = explosion.timeline.totalDuration - .95;
    this.lifespan = 0;

    this.setModel(model);

    this.addCollisionZone(32);
}

Game.objects.decorations.Explosion.prototype = Object.create(Game.objects.Decoration.prototype);
Game.objects.decorations.Explosion.constructor = Game.objects.decorations.Explosion;

Game.objects.decorations.Explosion.prototype.collides = function(withObject, ourZone, theirZone)
{
    if (withObject == this.emitter) {
        return;
    }

    if (withObject.inflictDamage) {
        withObject.inflictDamage(this.damage);
    }
}

Game.objects.decorations.Explosion.prototype.timeShift = function(dt)
{
    if (this.lifespan > this.lifetime) {
        this.scene.removeObject(this);
        return;
    }

    this.sprites.timeShift(dt);

    Game.objects.Decoration.prototype.timeShift.call(this, dt);

    this.lifespan += dt;
}
