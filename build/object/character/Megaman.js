Engine.assets.objects.characters.Megaman = function()
{
    this.__proto__ = new Engine.assets.objects.characters.Player();

    var LEFT = -1;
    var RIGHT = 1;

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

    var runLeft = new Engine.Sprite(Engine.Util.getTexture('sprites/megaman/running-left.gif'));
    runLeft.addFrames([.12,.12,.12,.12]);
    var runRight = new Engine.Sprite(Engine.Util.getTexture('sprites/megaman/running-right.gif'));
    runRight.addFrames([.12,.12,.12,.12]);

    var runFireLeft = new Engine.Sprite(Engine.Util.getTexture('sprites/megaman/running-fire-left.gif'));
    runFireLeft.addFrames([.12,.12,.12,.12]);
    var runFireRight = new Engine.Sprite(Engine.Util.getTexture('sprites/megaman/running-fire-right.gif'));
    runFireRight.addFrames([.12,.12,.12,.12]);


    var sprites = {};
    sprites[LEFT] = {
        'idle': idleLeft,
        'fire': fireLeft,
        'jump': jumpLeft,
        'jumpFire': jumpFireLeft,
        'lean': leanLeft,
        'run': runLeft,
        'runFire': runFireLeft,
    };
    sprites[RIGHT] = {
        'idle': idleRight,
        'fire': fireRight,
        'jump': jumpRight,
        'jumpFire': jumpFireRight,
        'lean': leanRight,
        'run': runRight,
        'runFire': runFireRight
    };

    var self = this;
    self.setDirection(RIGHT);

    var material = new THREE.MeshLambertMaterial({});
    material.transparent = true;

    var model = new THREE.Mesh(
        new THREE.PlaneBufferGeometry (32, 32),
        material
    );

    self.addCollisionZone(10, 0, 0);

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
            if (self.moveSpeed < self.walkSpeed) {
                return sprites[self.direction]['lean'];
            }
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
        if (currentSprite !== sprite) {
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
