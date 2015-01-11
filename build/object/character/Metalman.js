Engine.assets.objects.characters.Metalman = function()
{
    this.__proto__ = new Engine.assets.objects.Character();

    var LEFT = -1;
    var RIGHT = 1;

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


    var sprites = {};
    sprites[LEFT] = {
        'idle': idleLeft,
        'fire': fireLeft,
        'jump': jumpLeft,
        'jumpFire': jumpFireLeft,
        'run': runLeft,
        'runFire': fireLeft,
    };
    sprites[RIGHT] = {
        'idle': idleRight,
        'fire': fireRight,
        'jump': jumpRight,
        'jumpFire': jumpFireRight,
        'run': runRight,
        'runFire': fireRight
    };

    var self = this;
    self.setDirection(RIGHT);

    self.setFireTimeout(.2);

    var material = new THREE.MeshLambertMaterial({});
    material.transparent = true;

    var model = new THREE.Mesh(
        new THREE.PlaneBufferGeometry (48, 48),
        material
    );

    self.addCollisionZone(6, 0, 6);

    self.setJumpForce(250);

    self.setModel(model);

    self.getSprite = function()
    {
        if (self.walk != 0) {
            self.setDirection(self.walk > 0 ? RIGHT : LEFT);
        }

        if (!self.isSupported()) {
            if (self.isFiring) {
                return sprites[self.direction]['jumpFire'];
            }
            return sprites[self.direction]['jump'];
        }

        if (self.walk != 0) {
            if (self.isFiring) {
                return sprites[self.direction]['runFire'];
            }
            return sprites[self.direction]['run'];
        }

        if (self.isFiring) {
            return sprites[self.direction]['fire'];
        }

        return sprites[self.direction]['idle'];
    }

    var currentSprite;
    self.timeShift = function(t)
    {
        var sprite = self.getSprite();
        if (currentSprite != sprite) {
            if (currentSprite) {
                currentSprite.stop();
            }
            currentSprite = sprite;
            currentSprite.restart();
            self.model.material.map = currentSprite.texture;
        }
        self.__proto__.timeShift(t);
    }
}

