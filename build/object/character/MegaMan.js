Engine.assets.objects.characters.MegaMan = function()
{
    var currentSprite = undefined;

    var idleLeft = new Engine.Sprite(Engine.Util.getTexture('sprites/megaman/idle-left.gif'));
    idleLeft.addFrames([3.85,.15]);
    var idleRight = new Engine.Sprite(Engine.Util.getTexture('sprites/megaman/idle-right.gif'));
    idleRight.addFrames([3.85,.15]);

    var leanLeft = new Engine.Sprite(Engine.Util.getTexture('sprites/megaman/lean-left.gif'));
    var leanRight = new Engine.Sprite(Engine.Util.getTexture('sprites/megaman/lean-right.gif'));

    var runLeft = new Engine.Sprite(Engine.Util.getTexture('sprites/megaman/running-left.gif'));
    runLeft.addFrames([.12,.12,.12,.12]);
    var runRight = new Engine.Sprite(Engine.Util.getTexture('sprites/megaman/running-right.gif'));
    runRight.addFrames([.12,.12,.12,.12]);

    var sprites = {
        'left': {
            'idle': idleLeft,
            'jump': new Engine.Sprite(Engine.Util.getTexture('sprites/megaman/jumping-left.gif')),
            'lean': leanLeft,
            'run': runLeft,
        },
        'right': {
            'idle': idleRight,
            'jump': new Engine.Sprite(Engine.Util.getTexture('sprites/megaman/jumping-right.gif')),
            'lean': leanRight,
            'run': runRight,
        },
    };

    this.__proto__ = new Engine.assets.objects.characters.Player();
    var self = this;
    self.direction = 'right';

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
            self.direction = self.walk > 0 ? 'right' : 'left';
        }

        if (!self.isSupported()) {
            return sprites[self.direction]['jump'];
        }

        if (self.walk != 0) {
            if (self.moveSpeed < self.walkSpeed) {
                return sprites[self.direction]['lean'];
            }
            return sprites[self.direction]['run'];
        }

        return sprites[self.direction]['idle'];
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
