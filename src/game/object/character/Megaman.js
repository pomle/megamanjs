Game.objects.characters.Megaman = function()
{
    Game.objects.Character.call(this);

    this.health.max = 28;
    this.contactDamage.points = 0;
    this.jump.force = 197;
    this.invincibility.duration = 2;
    this.weapon.projectileEmitOffset.set(17, 1);

    this.textures = {};

    var map = this.model.material.map;
    this.textures['p'] = map;
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
        var canvas = Engine.TextureManager.cloneCanvas(map.image);
        var swaps = [
            [sourceColors[0], colorMap[code][0]],
            [sourceColors[1], colorMap[code][1]],
        ];
        Engine.TextureManager.replaceCanvasColors(canvas, swaps);
        this.textures[code] = Engine.TextureManager.createCanvasTexture(canvas);
        this.textures[code].needsUpdate = true;
    }

    this.decorations = {
        'sweat': new Game.objects.decorations.Sweat(),
    };

    this.bind(this.weapon.EVENT_EQUIP, this.changeDress);
}

Game.objects.characters.Megaman.prototype = Object.create(Game.objects.Character.prototype);
Game.objects.characters.Megaman.constructor = Game.objects.characters.Megaman;

Game.objects.characters.Megaman.prototype.changeDress = function(weapon)
{
    if (this.textures[weapon.code]) {
        this.model.material.map = this.textures[weapon.code];
        this.model.material.needsUpdate = true;
    }
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
        this.physics.momentum.x *= this.direction.x > 0 ? -1 : 1;
    }

    var sweat = this.decorations['sweat']
    sweat.position.copy(this.position);
    sweat.position.y += 12;
    sweat.sprites.sprite.time = 0;
    sweat.lifetime = 0;
    this.world.addObject(sweat);

    return true;
}

Game.objects.characters.Megaman.prototype.routeAnimation = function()
{
    if (this.teleport.state) {
        if (this.teleport.state == this.teleport.STATE_OUT) {
            return this.animator.pickAnimation('teleport-out');
        }
        else if (this.teleport.state == this.teleport.STATE_IN) {
            return this.animator.pickAnimation('teleport-in');
        }
        return this.animator.pickAnimation('teleport');
    }

    if (this.stun._engaged === true) {
        return this.animator.pickAnimation('stunned');
    }

    if (!this.isSupported) {
        if (this.weapon._firing) {
            return this.animator.pickAnimation('jump-fire');
        }
        return this.animator.pickAnimation('jump');
    }

    if (this.move._moveSpeed) {
        if (this.move._moveSpeed < this.move._speed * .8) {
            if (this.weapon._firing) {
                return this.animator.pickAnimation('fire');
            }
            return this.animator.pickAnimation('lean');
        }
        if (this.weapon._firing) {
            return this.animator.pickAnimation('run-fire');
        }
        return this.animator.pickAnimation('run');
    }

    if (this.weapon._firing) {
        return this.animator.pickAnimation('fire');
    }

    return this.animator.pickAnimation('idle');
}

Game.objects.characters.Megaman.prototype.timeShift = function(dt)
{
    this.routeAnimation();
    this.animator.update(dt);

    Game.objects.Character.prototype.timeShift.call(this, dt);
}
