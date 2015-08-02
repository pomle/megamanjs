Game.objects.characters.Metalman = function()
{
    Game.objects.Character.call(this);

    var model = Engine.SpriteManager.createSprite('bosses/metalman.png', 48, 48);
    this.sprites = new Engine.SpriteManager(model, 48, 48 , 256, 256);

    var idle = this.sprites.addSprite('idle');
    idle.addFrame(0, 0);

    var jump = this.sprites.addSprite('jump');
    jump.addFrame(0, 48);

    var fire = this.sprites.addSprite('fire', 'run-fire');
    fire.addFrame(48, 0);

    var jumpFire = this.sprites.addSprite('jump-fire');
    jumpFire.addFrame(96, 0, .05);
    jumpFire.addFrame(144, 0, 5);

    var run = this.sprites.addSprite('run', 'run-fire');
    run.addFrame(96,  48, .12);
    run.addFrame(48,  48, .12);
    run.addFrame(96,  48, .12);
    run.addFrame(144, 48, .12);

    this.setDirection(this.RIGHT);

    this.jumpForce = 250;

    this.setModel(model);
    this.addCollisionRect(12, 24, 0, 0);
}

Game.objects.characters.Metalman.prototype = Object.create(Game.objects.Character.prototype);
Game.objects.characters.Metalman.constructor = Game.objects.characters.Metalman;

Game.objects.characters.Metalman.prototype.updateSprite = function()
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
        if (this.isFiring) {
            return this.sprites.selectSprite('fire');
        }
        return this.sprites.selectSprite('run');
    }

    if (this.isFiring) {
        return this.sprites.selectSprite('fire');
    }

    return this.sprites.selectSprite('idle');
}

Game.objects.characters.Metalman.prototype.timeShift = function(dt)
{
    //this.updateAI(dt);
    this.updateSprite();
    this.sprites.timeShift(dt);
    Game.objects.Character.prototype.timeShift.call(this, dt);
}
