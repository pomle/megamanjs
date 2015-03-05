Engine.assets.objects.characters.Megaman = function()
{
    Engine.assets.objects.Character.call(this);

    var model = Engine.Util.createSprite('megaman/megaman.png', 48, 48);
    this.sprites = new Engine.SpriteManager(model, 48, 48 , 256, 256);

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

    var teleport = this.sprites.addSprite('teleport');
    teleport.addFrame(0,  144, .05);
    teleport.addFrame(48, 144, .05);
    teleport.addFrame(96, 144, .05);
    teleport.addFrame(0,  144);

    var stunned = this.sprites.addSprite('stunned');
    stunned.addFrame(192, 48, .08);
    stunned.addFrame(192, 96, .04);

    this.decorations = {
        'sweat': new Engine.assets.decorations.Sweat(),
    };


    this.sprites.selectSprite('idle');
    this.sprites.applySprite();

    this.isTeleporting = undefined;

    this.setDirection(this.RIGHT);
    this.sprites.setDirection(this.RIGHT);

    this.projectileEmitOffset.set(17, 1);

    this.energyCapsules = 0;

    this.setModel(model);
    this.addCollisionRect(14, 22, 0, 0);
}

Engine.assets.objects.characters.Megaman.prototype = Object.create(Engine.assets.objects.Character.prototype);
Engine.assets.objects.characters.Megaman.constructor = Engine.assets.objects.characters.Megaman;

Engine.assets.objects.characters.Megaman.prototype.inflictDamage = function(points, direction)
{
    if (!Engine.assets.objects.Character.prototype.inflictDamage.call(this, points)) {
        return false;
    }

    this.momentum.set(40, 60);
    if (direction) {
        this.momentum.x *= direction.x > 0 ? -1 : 1;
    }
    else {
        this.momentum.x *= this.direction > 0 ? -1 : 1;
    }

    this.decorations['sweat'].position.copy(this.position);
    this.decorations['sweat'].position.y += 12;
    this.decorations['sweat'].sprites.sprite.rewind();
    this.decorations['sweat'].lifespan = 0;

    this.scene.addObject(this.decorations['sweat']);

    return true;
}

Engine.assets.objects.characters.Megaman.prototype.selectSprite = function(dt)
{
    if (isFinite(this.isTeleporting)) {
        this.isTeleporting += dt;
        return this.sprites.selectSprite('teleport');
    }

    if (this.stunnedTime > 0) {
        return this.sprites.selectSprite('stunned');
    }

    if (this.walk) {
        this.sprites.setDirection(this.direction);
    }

    if (!this.isSupported) {
        if (this.isFiring) {
            return this.sprites.selectSprite('jump-fire');
        }
        return this.sprites.selectSprite('jump');
    }

    if (this.moveSpeed) {
        if (this.moveSpeed < this.walkSpeed * .8) {
            if (this.isFiring) {
                return this.sprites.selectSprite('fire');
            }
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
    this.selectSprite(dt);
    this.sprites.timeShift(dt);
    Engine.assets.objects.Character.prototype.timeShift.call(this, dt);
}
