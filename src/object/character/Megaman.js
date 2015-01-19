Engine.assets.objects.characters.Megaman = function()
{
    Engine.assets.objects.Character.call(this);

    this.LEFT = -1;
    this.RIGHT = 1;

    var idleLeft = new Engine.Sprite(Engine.Util.getTexture('sprites/megaman/idle-left.gif'));
    idleLeft.addFrames([3.85,.15]);
    var idleRight = new Engine.Sprite(Engine.Util.getTexture('sprites/megaman/idle-right.gif'));
    idleRight.addFrames([3.85,.15]);

    var leanLeft = new Engine.Sprite(Engine.Util.getTexture('sprites/megaman/lean-left.gif'));
    var leanRight = new Engine.Sprite(Engine.Util.getTexture('sprites/megaman/lean-right.gif'));

    var fireLeft = new Engine.Sprite(Engine.Util.getTexture('sprites/megaman/fire-left.gif'));
    var fireRight = new Engine.Sprite(Engine.Util.getTexture('sprites/megaman/fire-right.gif'));

    var jumpLeft = new Engine.Sprite(Engine.Util.getTexture('sprites/megaman/jump-left.gif'));
    var jumpRight = new Engine.Sprite(Engine.Util.getTexture('sprites/megaman/jump-right.gif'));

    var jumpFireLeft = new Engine.Sprite(Engine.Util.getTexture('sprites/megaman/jump-fire-left.gif'));
    var jumpFireRight = new Engine.Sprite(Engine.Util.getTexture('sprites/megaman/jump-fire-right.gif'));

    var runLeft = new Engine.Sprite(Engine.Util.getTexture('sprites/megaman/run-left.gif'));
    runLeft.addFrames([.12,.12,.12,.12]);
    var runRight = new Engine.Sprite(Engine.Util.getTexture('sprites/megaman/run-right.gif'));
    runRight.addFrames([.12,.12,.12,.12]);

    var runFireLeft = new Engine.Sprite(Engine.Util.getTexture('sprites/megaman/run-fire-left.gif'));
    runFireLeft.addFrames([.12,.12,.12,.12]);
    var runFireRight = new Engine.Sprite(Engine.Util.getTexture('sprites/megaman/run-fire-right.gif'));
    runFireRight.addFrames([.12,.12,.12,.12]);


    this.sprites = {};
    this.sprites[this.LEFT] = {
        'idle': idleLeft,
        'fire': fireLeft,
        'jump': jumpLeft,
        'jumpFire': jumpFireLeft,
        'lean': leanLeft,
        'run': runLeft,
        'runFire': runFireLeft,
    };
    this.sprites[this.RIGHT] = {
        'idle': idleRight,
        'fire': fireRight,
        'jump': jumpRight,
        'jumpFire': jumpFireRight,
        'lean': leanRight,
        'run': runRight,
        'runFire': runFireRight
    };

    this.setDirection(this.RIGHT);

    this.energyCapsules = 0;

    var model = Engine.Util.createSprite('megaman/idle-left.gif', 32, 32);
    this.setModel(model);

    this.addCollisionRect(10, 22, 0, 0);

    this.currentSprite = undefined;
}

Engine.assets.objects.characters.Megaman.prototype = Object.create(Engine.assets.objects.Character.prototype);
Engine.assets.objects.characters.Megaman.constructor = Engine.assets.objects.characters.Megaman;

Engine.assets.objects.characters.Megaman.prototype.getSprite = function()
{
    if (this.walk != 0) {
        this.setDirection(this.walk > 0 ? this.RIGHT : this.LEFT);
    }

    if (!this.isSupported) {
        if (this.isFiring) {
            return this.sprites[this.direction]['jumpFire'];
        }
        return this.sprites[this.direction]['jump'];
    }

    if (this.walk != 0) {
        if (this.moveSpeed < this.walkSpeed) {
            return this.sprites[this.direction]['lean'];
        }
        if (this.isFiring) {
            return this.sprites[this.direction]['runFire'];
        }
        return this.sprites[this.direction]['run'];
    }

    if (this.isFiring) {
        return this.sprites[this.direction]['fire'];
    }

    return this.sprites[this.direction]['idle'];
}

Engine.assets.objects.characters.Megaman.prototype.timeShift = function(t)
{
    var sprite = this.getSprite();
    if (this.currentSprite !== sprite) {
        if (this.currentSprite) {
            this.currentSprite.stop();
        }
        this.currentSprite = sprite;
        this.currentSprite.restart();
        this.model.material.map = this.currentSprite.texture;
    }
    Engine.assets.objects.Character.prototype.timeShift.call(this, t);
}
