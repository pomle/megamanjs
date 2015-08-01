Game.objects.characters.Megaman = function()
{
    Game.objects.Character.call(this);

    this.health.max = 28;

    this.textures = {};

    var model = Engine.SpriteManager.createSprite('megaman/megaman.png', 48, 48, function populateTextures() {
        this.textures['p'] = model.material.map;
        var sourceColors = [new THREE.Vector3(0,115,247), new THREE.Vector3(0,255,255)];
        var colorMap = {
            'a': [new THREE.Vector3(0,120,248),
                  new THREE.Vector3(248,248,248)],
            'b': [new THREE.Vector3(124,124,124),
                  new THREE.Vector3(248,248,248)],
            'c': [new THREE.Vector3(248,120,88),
                  new THREE.Vector3(248,248,248)],
            'f': [new THREE.Vector3(216,0,204),
                  new THREE.Vector3(248,184,248)],
            'h': [new THREE.Vector3(228,0,88),
                  new THREE.Vector3(248,184,0)],
            'm': [new THREE.Vector3(172,175,0),
                  new THREE.Vector3(255,224,168)],
            'q': [new THREE.Vector3(248,88,152),
                  new THREE.Vector3(248,184,248)],
            'w': [new THREE.Vector3(0,184,0),
                  new THREE.Vector3(248,248,248)],
            'item': [new THREE.Vector3(248,56,0),
                     new THREE.Vector3(248,248,248)],
        }
        for (var code in colorMap) {
            var canvas = Engine.TextureManager.cloneCanvas(model.material.map.image);
            var swaps = [
                [sourceColors[0], colorMap[code][0]],
                [sourceColors[1], colorMap[code][1]],
            ];
            Engine.TextureManager.replaceCanvasColors(canvas, swaps);
            this.textures[code] = Engine.TextureManager.createCanvasTexture(canvas);
            this.textures[code].needsUpdate = true;
        }
    }.bind(this));


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
    teleport.addFrame(0,  144);

    var teleportEnd = this.sprites.addSprite('teleport-in');
    teleportEnd.addFrame(48, 144, .05);
    teleportEnd.addFrame(96, 144, .05);
    teleportEnd.addFrame(0,  144, .05);
    teleportEnd.addFrame(0,  0);

    var teleportStart = this.sprites.addSprite('teleport-out');
    teleportStart.addFrame(0,  144, .05);
    teleportStart.addFrame(48, 144, .05);
    teleportStart.addFrame(96, 144, .05);
    teleportStart.addFrame(0,  144);

    var stunned = this.sprites.addSprite('stunned');
    stunned.addFrame(192, 48, .08);
    stunned.addFrame(192, 96, .04);

    this.decorations = {
        'sweat': new Game.objects.decorations.Sweat(),
    };


    this.sprites.selectSprite('idle');
    this.sprites.applySprite();

    this.setDirection(this.RIGHT);
    this.sprites.setDirection(this.RIGHT);

    this.projectileEmitOffset.set(17, 1);

    this.energyCapsules = 0;

    this.setModel(model);
    this.addCollisionRect(14, 22, 0, 0);

    this.teleport = this.applyTrait(new Game.traits.Teleport());
}

Game.objects.characters.Megaman.prototype = Object.create(Game.objects.Character.prototype);
Game.objects.characters.Megaman.constructor = Game.objects.characters.Megaman;

Game.objects.characters.Megaman.prototype.equipWeapon = function(weapon)
{
    if (!Game.objects.Character.prototype.equipWeapon.call(this, weapon)) {
        return false;
    }

    if (this.textures[weapon.code]) {
        this.model.material.map = this.textures[weapon.code];
        this.model.material.needsUpdate = true;
    }

    return true;
}

Game.objects.characters.Megaman.prototype.inflictDamage = function(points, direction)
{
    if (!Game.objects.Character.prototype.inflictDamage.call(this, points)) {
        return false;
    }

    this.jump.end();
    this.physics.inertia.set(0, 0);
    this.physics.momentum.set(40, 60);
    if (direction) {
        this.physics.momentum.x *= direction.x > 0 ? -1 : 1;
    }
    else {
        this.physics.momentum.x *= this.direction > 0 ? -1 : 1;
    }

    var sweat = this.decorations['sweat']
    sweat.position.copy(this.position);
    sweat.position.y += 12;
    sweat.sprites.sprite.time = 0;
    sweat.lifetime = 0;
    this.world.addObject(sweat);

    return true;
}

Game.objects.characters.Megaman.prototype.selectSprite = function(dt)
{
    if (this.teleport.state) {
        if (this.teleport.state == this.teleport.STATE_OUT) {
            return this.sprites.selectSprite('teleport-out');
        }
        else if (this.teleport.state == this.teleport.STATE_IN) {
            return this.sprites.selectSprite('teleport-in');
        }
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

Game.objects.characters.Megaman.prototype.timeShift = function(dt)
{
    this.selectSprite(dt);
    this.sprites.timeShift(dt);

    Game.objects.Character.prototype.timeShift.call(this, dt);
}
