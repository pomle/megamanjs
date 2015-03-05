Engine.assets.objects.characters.Metalman = function()
{
    Engine.assets.objects.Character.call(this);

    var model = Engine.Util.createSprite('bosses/metalman/tiles.gif', 48, 48);
    this.sprites = new Engine.SpriteManager(model, 48, 48 , 256, 96);

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
    this.sprites.setDirection(this.RIGHT);

    this.fireTimeout = .2;

    var material = new THREE.MeshLambertMaterial({});
    material.transparent = true;

    this.jumpForce = 250;

    this.setModel(model);
    this.addCollisionRect(12, 24, 0, 0);

    this.timeAIUpdated = null;
}

Engine.assets.objects.characters.Metalman.prototype = Object.create(Engine.assets.objects.Character.prototype);
Engine.assets.objects.characters.Metalman.constructor = Engine.assets.objects.characters.Metalman;

Engine.assets.objects.characters.Metalman.prototype.updateAI = function()
{
    if (Math.abs(this.time - this.timeAIUpdated) > 2) {
        var o;
        for (var i in this.scene.objects) {
            o = this.scene.objects[i];
            if (o instanceof Engine.assets.objects.characters.Megaman) {
                this.walk = this.model.position.x > o.model.position.x ? -1 : 1;
                break;
            }
        }

        this.timeAIUpdated = this.time;
    }
}

Engine.assets.objects.characters.Metalman.prototype.updateSprite = function()
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

Engine.assets.objects.characters.Metalman.prototype.timeShift = function(dt)
{
    //this.updateAI(dt);
    this.updateSprite();
    this.sprites.timeShift(dt);
    Engine.assets.objects.Character.prototype.timeShift.call(this, dt);
}
