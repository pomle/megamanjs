Engine.assets.objects.characters.Metalman = function()
{
    Engine.assets.objects.Character.call(this);

    this.LEFT = -1;
    this.RIGHT = 1;

    var idleLeft = new Engine.Sprite(Engine.Util.getTexture('sprites/bosses/metalman/idle-left.gif'));
    var idleRight = new Engine.Sprite(Engine.Util.getTexture('sprites/bosses/metalman/idle-right.gif'));

    var fireLeft = new Engine.Sprite(Engine.Util.getTexture('sprites/bosses/metalman/fire-left.gif'));
    var fireRight = new Engine.Sprite(Engine.Util.getTexture('sprites/bosses/metalman/fire-right.gif'));

    var jumpLeft = new Engine.Sprite(Engine.Util.getTexture('sprites/bosses/metalman/jump-left.gif'));
    var jumpRight = new Engine.Sprite(Engine.Util.getTexture('sprites/bosses/metalman/jump-right.gif'));

    var jumpFireLeft = new Engine.Sprite(Engine.Util.getTexture('sprites/bosses/metalman/jump-fire-left.gif'));
    jumpFireLeft.addFrames([.02,1]);
    var jumpFireRight = new Engine.Sprite(Engine.Util.getTexture('sprites/bosses/metalman/jump-fire-right.gif'));
    jumpFireRight.addFrames([.02,1]);

    var runLeft = new Engine.Sprite(Engine.Util.getTexture('sprites/bosses/metalman/running-left.gif'));
    runLeft.addFrames([.12,.12,.12,.12]);
    var runRight = new Engine.Sprite(Engine.Util.getTexture('sprites/bosses/metalman/running-right.gif'));
    runRight.addFrames([.12,.12,.12,.12]);


    this.sprites = {};
    this.sprites[this.LEFT] = {
        'idle': idleLeft,
        'fire': fireLeft,
        'jump': jumpLeft,
        'jumpFire': jumpFireLeft,
        'run': runLeft,
        'runFire': fireLeft,
    };
    this.sprites[this.RIGHT] = {
        'idle': idleRight,
        'fire': fireRight,
        'jump': jumpRight,
        'jumpFire': jumpFireRight,
        'run': runRight,
        'runFire': fireRight,
    };

    this.setDirection(this.RIGHT);

    this.setFireTimeout(.2);

    var material = new THREE.MeshLambertMaterial({});
    material.transparent = true;

    var model = new THREE.Mesh(
        new THREE.PlaneBufferGeometry(48, 48),
        material
    );

    this.setJumpForce(250);

    this.setModel(model);
    this.addCollisionRect(12, 24, 0, 0);

    this.currentSprite;

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
                this.walk = o.walk;
                break;
            }
        }

        this.timeAIUpdated = this.time;
    }
}

Engine.assets.objects.characters.Metalman.prototype.getSprite = function()
{
    if (this.walk != 0) {
        this.setDirection(this.walk > 0 ? this.RIGHT : this.LEFT);
    }

    var sprites = this.sprites[this.direction];

    if (!this.isSupported) {
        if (this.isFiring) {
            return sprites['jumpFire'];
        }
        return sprites['jump'];
    }

    if (this.moveSpeed) {
        if (this.isFiring) {
            return sprites['runFire'];
        }
        return sprites['run'];
    }

    if (this.isFiring) {
        return sprites['fire'];
    }

    return sprites['idle'];
}

Engine.assets.objects.characters.Metalman.prototype.timeShift = function(t)
{
    this.updateAI(t);
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
