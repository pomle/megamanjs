Game.objects.characters.Megaman = function()
{
    Game.objects.Character.call(this);

    this.decorations = {
        'sweat': new Game.objects.decorations.Sweat(),
    };

    this.bind(Engine.traits.Weapon.prototype.EVENT_EQUIP, this.changeDress);
}

Game.objects.characters.Megaman.prototype = Object.create(Game.objects.Character.prototype);
Game.objects.characters.Megaman.constructor = Game.objects.characters.Megaman;

Game.objects.characters.Megaman.prototype.changeDress = function(weapon)
{
    var textureId = "megaman-" + weapon.code;
    if (this.textures[textureId]) {
        this.model.material.map = this.textures[textureId];
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
    var anim = this.animators[0];
    if (this.teleport.state) {
        if (this.teleport.state == this.teleport.STATE_OUT) {
            return anim.pickAnimation('teleport-out');
        }
        else if (this.teleport.state == this.teleport.STATE_IN) {
            return anim.pickAnimation('teleport-in');
        }
        return anim.pickAnimation('teleport');
    }

    if (this.stun._engaged === true) {
        return anim.pickAnimation('stunned');
    }

    if (!this.isSupported) {
        if (this.weapon._firing) {
            return anim.pickAnimation('jump-fire');
        }
        return anim.pickAnimation('jump');
    }

    if (this.move._moveSpeed) {
        if (this.move._moveSpeed < this.move.speed * .8) {
            if (this.weapon._firing) {
                return anim.pickAnimation('fire');
            }
            return anim.pickAnimation('lean');
        }
        if (this.weapon._firing) {
            return anim.pickAnimation('run-fire');
        }
        return anim.pickAnimation('run');
    }

    if (this.weapon._firing) {
        return anim.pickAnimation('fire');
    }

    return anim.pickAnimation('idle');
}

Game.objects.characters.Megaman.prototype.timeShift = function(dt)
{
    this.routeAnimation();
    Game.objects.Character.prototype.timeShift.call(this, dt);
}
