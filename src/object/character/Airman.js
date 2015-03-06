Engine.assets.objects.characters.Airman = function()
{
    Engine.assets.objects.Character.call(this);

    var model = Engine.Util.createSprite('bosses/airman.png', 48, 48);
    this.sprites = new Engine.SpriteManager(model, 48, 48 , 256, 256);

    var idle = this.sprites.addSprite('idle');
    idle.addFrame(0, 0);

    var fire = this.sprites.addSprite('fire');
    fire.addFrame(96, 0);

    var jump = this.sprites.addSprite('jump');
    jump.addFrame(48, 0);

    var blow = this.sprites.addSprite('blow');
    blow.addFrame(144,  0, .12);
    blow.addFrame(192,  0, .12);

    this.setModel(model);

    this.addCollisionRect(20, 28, 0, 0);
    this.setDirection(this.RIGHT);
    this.projectileEmitOffset.set(22, -1);

    this.isBlowing = false;
    this.jumpForce = 260;
}

Engine.assets.objects.characters.Airman.prototype = Object.create(Engine.assets.objects.Character.prototype);
Engine.assets.objects.characters.Airman.constructor = Engine.assets.objects.characters.Airman;

Engine.assets.objects.characters.Airman.prototype.updateSprite = function()
{
    if (this.walk != 0) {
        this.sprites.setDirection(this.direction);
    }

    if (this.isFiring) {
        return this.sprites.selectSprite('fire');
    }

    if (!this.isSupported) {
        return this.sprites.selectSprite('jump');
    }

    if (this.isBlowing) {
        return this.sprites.selectSprite('blow');
    }

    return this.sprites.selectSprite('idle');
}

Engine.assets.objects.characters.Airman.prototype.timeShift = function(dt)
{
    this.updateSprite();
    this.sprites.timeShift(dt);
    Engine.assets.objects.Character.prototype.timeShift.call(this, dt);
}
