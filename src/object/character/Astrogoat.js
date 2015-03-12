Engine.assets.objects.characters.Astrogoat = function()
{
    Engine.assets.objects.Character.call(this);

    var model = Engine.Util.createSprite('megaman/astrogoat.png', 48, 48);
    this.sprites = new Engine.SpriteManager(model, 48, 48 , 256, 256);

    var idle = this.sprites.addSprite('idle');
    idle.addFrame(0, 0);

    var run = this.sprites.addSprite('run');
    run.addFrame(48,  0, .06);
    run.addFrame(96,  0, .06);
    run.addFrame(144, 0, .06);
    run.addFrame(96,  0, .06);

    this.sprites.selectSprite('idle');
    this.sprites.applySprite();

    this.setDirection(this.RIGHT);

    this.projectileEmitOffset.set(17, 1);

    this.setModel(model);
    this.addCollisionRect(20, 32, 0, 0);
}

Engine.assets.objects.characters.Astrogoat.prototype = Object.create(Engine.assets.objects.Character.prototype);
Engine.assets.objects.characters.Astrogoat.constructor = Engine.assets.objects.characters.Astrogoat;

Engine.assets.objects.characters.Astrogoat.prototype.selectSprite = function(dt)
{
    if (this.walk) {
        this.sprites.setDirection(this.direction);
    }

    if (this.moveSpeed) {
        return this.sprites.selectSprite('run');
    }

    return this.sprites.selectSprite('idle');
}

Engine.assets.objects.characters.Astrogoat.prototype.timeShift = function(dt)
{
    this.selectSprite(dt);
    this.sprites.timeShift(dt);
    Engine.assets.objects.Character.prototype.timeShift.call(this, dt);
}
