Engine.assets.objects.characters.Heatman = function()
{
    Engine.assets.objects.Character.call(this);

    var model = Engine.Util.createSprite('bosses/heatman.png', 48, 48);
    this.sprites = new Engine.SpriteManager(model, 48, 48 , 256, 256);

    var idle = this.sprites.addSprite('idle');
    idle.addFrame(0, 0);

    var fire = this.sprites.addSprite('fire');
    fire.addFrame(48, 48, .06);
    fire.addFrame(96, 48);

    var jump = this.sprites.addSprite('jump');
    jump.addFrame(0, 48);

    var burn = this.sprites.addSprite('burn');
    burn.addFrame(48, 0, .06);
    burn.addFrame(96, 0, .06);

    var flame = this.sprites.addSprite('flame');
    flame.addFrame(0,  96, .06);
    flame.addFrame(48, 96, .06);
    flame.addFrame(96, 96, .06);

    var toFlame = this.sprites.addSprite('toFlame');
    toFlame.addFrame(96, 144, .03);
    toFlame.addFrame(48, 144, .03);
    toFlame.addFrame(0, 144);

    var fromFlame = this.sprites.addSprite('fromFlame');
    fromFlame.addFrame(0, 144, .03);
    fromFlame.addFrame(48, 144, .03);
    fromFlame.addFrame(96, 144);

    this.addCollisionRect(12, 24, 0, 0);

    this.setModel(model);

    this.setDirection(this.RIGHT);
    this.sprites.setDirection(this.RIGHT);

    this.projectileEmitOffset.set(0, 0);

    this.jumpForce = 100;

    this.flameTransformDuration = .09;
    this.flameTransformTime = 0;

    this.walkAcc = 1000;
    this.walkSpeed = 300;
}

Engine.assets.objects.characters.Heatman.prototype = Object.create(Engine.assets.objects.Character.prototype);
Engine.assets.objects.characters.Heatman.constructor = Engine.assets.objects.characters.Heatman;

Engine.assets.objects.characters.Heatman.prototype.updateSprite = function()
{
    if (this.walk) {
        console.log(this.direction);
        this.sprites.setDirection(this.direction);
    }

    if (this.moveSpeed) {
        if (this.flameTransformTime < this.flameTransformDuration) {
            this.flameTransformTime += this.deltaTime;
            return this.sprites.selectSprite('toFlame');
        }
        this.flameTransformTime = this.flameTransformDuration;
        return this.sprites.selectSprite('flame');
    }
    else {
        if (this.isFiring) {
            return this.sprites.selectSprite('fire');
        }

        if (!this.isSupported) {
            return this.sprites.selectSprite('jump');
        }

        if (this.isInvincible) {
            return this.sprites.selectSprite('burn');
        }
        if (this.flameTransformTime > 0) {
            this.flameTransformTime -= this.deltaTime;
            return this.sprites.selectSprite('fromFlame');
        }
        this.flameTransformTime = 0;
        return this.sprites.selectSprite('idle');
    }
}

Engine.assets.objects.characters.Heatman.prototype.timeShift = function(dt)
{
    this.updateSprite();
    Engine.assets.objects.Character.prototype.timeShift.call(this, dt);
    this.sprites.timeShift(dt);
}
