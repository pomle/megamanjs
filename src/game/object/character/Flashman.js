Game.objects.characters.Flashman = function()
{
    Game.objects.Character.call(this);

    var model = Engine.SpriteManager.createSprite('bosses/flashman.png', 48, 48);
    this.sprites = new Engine.SpriteManager(model, 48, 48 , 256, 256);

    var idle = this.sprites.addSprite('idle');
    idle.addFrame(0, 0);

    var fire = this.sprites.addSprite('fire');
    fire.addFrame(48, 0);

    var jump = this.sprites.addSprite('jump');
    jump.addFrame(0, 48);

    var run = this.sprites.addSprite('run');
    run.addFrame(48,  48, .12);
    run.addFrame(96,  48, .12);

    var taunt = this.sprites.addSprite('taunt');
    taunt.addFrame(0,  96);

    var flash = this.sprites.addSprite('flash');
    flash.addFrame(48,  96, .4);
    flash.addFrame(96,  96, .18);
    flash.addFrame(144, 96, .18);
    flash.addFrame(48,  96);

    this.setDirection(this.RIGHT);
    this.sprites.setDirection(this.RIGHT);

    this.projectileEmitOffset.set(18, 3);

    this.jumpForce = 160;

    this.isFlashing = false;

    this.setModel(model);
    this.addCollisionRect(12, 24, 0, 0);
}

Game.objects.characters.Flashman.prototype = Object.create(Game.objects.Character.prototype);
Game.objects.characters.Flashman.constructor = Game.objects.characters.Flashman;

Game.objects.characters.Flashman.prototype.updateSprite = function()
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

    if (this.moveSpeed) {
        return this.sprites.selectSprite('run');
    }

    if (this.isFlashing) {
        return this.sprites.selectSprite('flash');
    }

    return this.sprites.selectSprite('idle');
}

Game.objects.characters.Flashman.prototype.timeShift = function(dt)
{
    //this.updateAI(dt);
    this.updateSprite();
    this.sprites.timeShift(dt);
    Game.objects.Character.prototype.timeShift.call(this, dt);
}
