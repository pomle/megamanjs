Engine.assets.objects.characters.MegaMan = function()
{
    var currentSprite = undefined;

    var idleLeft = new Engine.Sprite(THREE.ImageUtils.loadTexture('sprites/megaman/idle-left.gif'));
    idleLeft.addFrames([3.85,.15]);
    var idleRight = new Engine.Sprite(THREE.ImageUtils.loadTexture('sprites/megaman/idle-right.gif'));
    idleRight.addFrames([3.85,.15]);

    var runLeft = new Engine.Sprite(THREE.ImageUtils.loadTexture('sprites/megaman/running-left.gif'));
    runLeft.addFrames([.1,.1,.1]);
    var runRight = new Engine.Sprite(THREE.ImageUtils.loadTexture('sprites/megaman/running-right.gif'));
    runRight.addFrames([.1,.1,.1]);

    var sprites = {
        'left': {
            'idle': idleLeft,
            'jump': new Engine.Sprite(THREE.ImageUtils.loadTexture('sprites/megaman/jumping-left.gif')),
            'run': runLeft,
        },
        'right': {
            'idle': idleRight,
            'jump': new Engine.Sprite(THREE.ImageUtils.loadTexture('sprites/megaman/jumping-right.gif')),
            'run': runRight,
        },
    };

    this.__proto__ = new Engine.assets.objects.characters.Player();
    var self = this;
    self.horizontalDirection = 'right';

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
        if (self.walk > 0) {
            self.horizontalDirection = 'right';
        }
        else if (self.walk < 0) {
            self.horizontalDirection = 'left';
        }

        if (!self.isSupported()) {
            return sprites[self.horizontalDirection]['jump'];
        }
        if (self.walk != 0) {
            return sprites[self.horizontalDirection]['run'];
        }
        return sprites[self.horizontalDirection]['idle'];
    }

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
