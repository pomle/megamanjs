Game.objects.characters.Airman = function()
{
    Game.objects.Character.call(this);
    this.contactDamage.points = 4;
    this.jump.force = 260;

    var model = Engine.SpriteManager.createSprite('bosses/airman.png', 48, 48);
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
    this.weapon.projectileEmitOffset.set(22, -1);

    this.isBlowing = false;

}

Game.objects.characters.Airman.prototype = Object.create(Game.objects.Character.prototype);
Game.objects.characters.Airman.constructor = Game.objects.characters.Airman;

Game.objects.characters.Airman.prototype.updateSprite = function()
{
    if (this.walk != 0) {
        this.sprites.setDirection(this.direction.x);
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

Game.objects.characters.Airman.prototype.timeShift = function(dt)
{
    this.updateSprite();
    this.sprites.timeShift(dt);
    Game.objects.Character.prototype.timeShift.call(this, dt);
}
