Engine.assets.objects.characters.Megaman = function()
{
    Engine.assets.objects.Character.call(this);

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
        'sweat': new Engine.assets.decorations.Sweat(),
    };


    this.sprites.selectSprite('idle');
    this.sprites.applySprite();

    this.isTeleporting = false;
    this.teleportEndDelay = .15;
    this.teleportEndDuration = 0;
    this.teleportStartDelay = .15;
    this.teleportStartDuration = 0;
    this.teleportSpeed = 600;
    this.teleportPos = new THREE.Vector2();

    this.setDirection(this.RIGHT);
    this.sprites.setDirection(this.RIGHT);

    this.projectileEmitOffset.set(17, 1);

    this.energyCapsules = 0;

    this.setModel(model);
    this.addCollisionRect(14, 22, 0, 0);
}

Engine.assets.objects.characters.Megaman.prototype = Object.create(Engine.assets.objects.Character.prototype);
Engine.assets.objects.characters.Megaman.constructor = Engine.assets.objects.characters.Megaman;

Engine.assets.objects.characters.Megaman.prototype.equipWeapon = function(weapon)
{
    if (!Engine.assets.objects.Character.prototype.equipWeapon.call(this, weapon)) {
        return false;
    }

    if (this.textures[weapon.code]) {
        this.model.material.map = this.textures[weapon.code];
        this.model.material.needsUpdate = true;
    }

    return true;
}

Engine.assets.objects.characters.Megaman.prototype.inflictDamage = function(points, direction)
{
    if (!Engine.assets.objects.Character.prototype.inflictDamage.call(this, points)) {
        return false;
    }

    this.jumpInertia = 0;
    this.inertia.set(0, 0);
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
    if (this.isTeleporting) {
        if (this.teleportStartDuration) {
            return this.sprites.selectSprite('teleport-out');
        }
        else if (this.teleportEndDuration) {
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

Engine.assets.objects.characters.Megaman.prototype.teleportTo = function(pos)
{
    this.teleportPos = pos;
    this.teleportStart();
}

Engine.assets.objects.characters.Megaman.prototype.teleportStart = function()
{
    this.teleportStartDuration = this.teleportStartDelay;
    this.collidable = false;
    this.isSupported = false;
    this.isTeleporting = true;
    this.mass = 0;
    this.trigger('teleport-start');
}

Engine.assets.objects.characters.Megaman.prototype.teleportEnd = function()
{
    this.teleportEndDuration = this.teleportEndDelay;
    this.collidable = true;
    this.isSupported = true;
    this.momentum.multiplyScalar(0);
    this.inertia.multiplyScalar(0);
    this.mass = 1;
    this.trigger('teleport-end');
}

Engine.assets.objects.characters.Megaman.prototype.teleportHandle = function(dt)
{
    if (this.teleportStartDuration) {
        this.teleportStartDuration = Math.max(0, this.teleportStartDuration - dt);
    }
    else if (this.teleportEndDuration) {
        this.teleportEndDuration = Math.max(0, this.teleportEndDuration - dt);
        if (this.teleportEndDuration == 0) {
            this.isTeleporting = false;
        }
    }
    else {
        var teleportDistance = Engine.Animation.vectorTraverse(
            this.position, this.teleportPos, this.teleportSpeed * dt);
        if (teleportDistance === 0) {
            this.teleportEnd();
        }
    }
}

Engine.assets.objects.characters.Megaman.prototype.timeShift = function(dt)
{
    this.selectSprite(dt);
    this.sprites.timeShift(dt);

    if (this.isTeleporting) {
        this.teleportHandle(dt);
    }
    else {
        Engine.assets.objects.Character.prototype.timeShift.call(this, dt);
    }
}
