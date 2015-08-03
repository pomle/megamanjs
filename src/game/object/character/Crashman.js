Game.objects.characters.Crashman = function()
{
    Game.objects.Character.call(this);
    this.contactDamage.points = 4;

    var model = Engine.SpriteManager.createSprite('bosses/crashman.png', 48, 48);
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

    this.jump.force = 250;

    this.setModel(model);
    this.addCollisionRect(12, 24, 0, 0);
}

Game.objects.characters.Crashman.prototype = Object.create(Game.objects.Character.prototype);
Game.objects.characters.Crashman.constructor = Game.objects.characters.Crashman;

Game.objects.characters.Crashman.prototype.updateSprite = function()
{
    if (this.walk != 0) {
        this.sprites.setDirection(this.direction.x);
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

Game.objects.characters.Crashman.prototype.timeShift = function(dt)
{
    this.updateSprite();
    this.sprites.timeShift(dt);
    Game.objects.Character.prototype.timeShift.call(this, dt);
}
