Engine.assets.objects.characters.Megaman = function()
{
    Engine.assets.objects.Character.call(this);

    this.LEFT = -1;
    this.RIGHT = 1;

    var model = Engine.Util.createSprite('megaman/tiles.gif', 48, 48);
    this.sprites = new Engine.SpriteManager(model, 48, 48 , 256, 144);

    var idle = this.sprites.addSprite('idle');
    idle.addFrame(0, 0, 3.85);
    idle.addFrame(48, 0, .15);

    var lean = this.sprites.addSprite('lean');
    lean.addFrame(144, 48);

    var jump = this.sprites.addSprite('jump');
    jump.addFrame(144, 0);

    var fire = this.sprites.addSprite('fire');
    fire.addFrame(96, 0);

    var jumpFire = this.sprites.addSprite('jump-fire');
    jumpFire.addFrame(192, 0);

    var run = this.sprites.addSprite('run', 'run');
    run.addFrame(48, 48, .12);
    run.addFrame(0,  48, .12);
    run.addFrame(48, 48, .12);
    run.addFrame(96, 48, .12);

    var runFire = this.sprites.addSprite('run-fire', 'run');
    runFire.addFrame(48, 96, .12);
    runFire.addFrame(0,  96, .12);
    runFire.addFrame(48, 96, .12);
    runFire.addFrame(96, 96, .12);

    this.setDirection(this.RIGHT);
    this.sprites.setDirection(this.RIGHT);

    this.energyCapsules = 0;

    this.setModel(model);
    this.addCollisionRect(10, 22, 0, 0);
}

Engine.assets.objects.characters.Megaman.prototype = Object.create(Engine.assets.objects.Character.prototype);
Engine.assets.objects.characters.Megaman.constructor = Engine.assets.objects.characters.Megaman;

Engine.assets.objects.characters.Megaman.prototype.selectSprite = function()
{
    if (this.walk != 0) {
        this.setDirection(this.walk > 0 ? this.RIGHT : this.LEFT);
        this.sprites.setDirection(this.walk > 0 ? this.RIGHT : this.LEFT);
    }

    // If we have any vertical speed we are "falling".
    if (this.speed.y) {
        if (this.isFiring) {
            return this.sprites.selectSprite('jump-fire');
        }
        return this.sprites.selectSprite('jump');
    }

    if (this.moveSpeed) {
        if (this.moveSpeed < this.walkSpeed * .8) {
            return this.sprites.selectSprite('lean');
        }
        if (this.isFiring) {
            return this.sprites.selectSprite('run-fire');
        }
        return this.sprites.selectSprite('run');
    }

    if (this.isFiring) {
        return this.sprites.selectSprite('fire');
    }

    return this.sprites.selectSprite('idle');
}

Engine.assets.objects.characters.Megaman.prototype.timeShift = function(dt)
{
    this.selectSprite();
    this.sprites.timeShift(dt);
    Engine.assets.objects.Character.prototype.timeShift.call(this, dt);
}
