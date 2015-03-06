Engine.assets.objects.characters.Crashman = function()
{
    Engine.assets.objects.Character.call(this);

    var model = Engine.Util.createSprite('bosses/crashman.png', 48, 48);
    this.sprites = new Engine.SpriteManager(model, 48, 48 , 256, 256);

    var taunt = this.sprites.addSprite('taunt');
    taunt.addFrame(0, 0);

    var idle = this.sprites.addSprite('idle');
    idle.addFrame(0, 0);

    var jump = this.sprites.addSprite('jump');
    jump.addFrame(0, 96);

    var jumpFire = this.sprites.addSprite('jump-fire');
    jumpFire.addFrame(48, 96, .05);
    jumpFire.addFrame(96, 96, 5);

    var run = this.sprites.addSprite('run');
    run.addFrame(0,  48, .12);
    run.addFrame(48, 48, .12);
    run.addFrame(0,  48, .12);
    run.addFrame(96, 48, .12);

    this.setDirection(this.RIGHT);

    this.jumpForce = 250;

    this.setModel(model);
    this.addCollisionRect(12, 24, 0, 0);
}

Engine.assets.objects.characters.Crashman.prototype = Object.create(Engine.assets.objects.Character.prototype);
Engine.assets.objects.characters.Crashman.constructor = Engine.assets.objects.characters.Crashman;

Engine.assets.objects.characters.Crashman.prototype.updateSprite = function()
{
    if (this.walk != 0) {
        this.sprites.setDirection(this.direction);
    }

    if (!this.isSupported) {
        if (this.isFiring) {
            return this.sprites.selectSprite('jump-fire');
        }
        return this.sprites.selectSprite('jump');
    }

    if (this.moveSpeed) {
        return this.sprites.selectSprite('run');
    }

    return this.sprites.selectSprite('idle');
}

Engine.assets.objects.characters.Crashman.prototype.timeShift = function(dt)
{
    this.updateSprite();
    this.sprites.timeShift(dt);
    Engine.assets.objects.Character.prototype.timeShift.call(this, dt);
}
