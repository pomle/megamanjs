Game.objects.characters.Megaman = function()
{
    Game.objects.Character.call(this);

    this.decorations = {
        'sweat': new Game.objects.decorations.Sweat(),
    };

    this.bind(Game.traits.Weapon.prototype.EVENT_EQUIP, this.changeDress);
    this.bind(Game.traits.Health.prototype.EVENT_HURT, this.damage)
}

Engine.Util.extend(Game.objects.characters.Megaman,
                   Game.objects.Character);

Game.objects.characters.Megaman.prototype.changeDress = function(weapon)
{
    var textureId = "megaman-" + weapon.code;
    if (this.textures[textureId]) {
        this.model.material.map = this.textures[textureId];
        this.model.material.needsUpdate = true;
    }
}

Game.objects.characters.Megaman.prototype.damage = function(points, direction)
{
    if (this.health.amount > 0) {
        var sweat = this.decorations['sweat']
        sweat.position.copy(this.position);
        sweat.position.y += 12;
        sweat.sprites.sprite.time = 0;
        sweat.lifetime = 0;
        this.world.addObject(sweat);
    }
    return true;
}

Game.objects.characters.Megaman.prototype.routeAnimation = function()
{
    if (this.teleport.state) {
        if (this.teleport.state == this.teleport.STATE_OUT) {
            return 'teleport-out';
        }
        else if (this.teleport.state == this.teleport.STATE_IN) {
            return 'teleport-in';
        }
        return 'teleport';
    }

    if (this.stun._engaged === true) {
        return 'stunned';
    }

    if (this.climber.attached !== undefined) {
        if (this.weapon._firing) {
            return 'hang-shoot';
        }
        if (this.velocity.y !== 0) {
            return 'climbing';
        }
        return 'hang';
    }

    if (!this.isSupported) {
        if (this.weapon._firing) {
            return 'jump-fire';
        }
        return 'jump';
    }

    if (this.move._interimSpeed) {
        if (this.move._interimSpeed < this.move.speed * .8) {
            if (this.weapon._firing) {
                return 'fire';
            }
            return 'lean';
        }
        if (this.weapon._firing) {
            return 'run-fire';
        }
        return 'run';
    }

    if (this.weapon._firing) {
        return 'fire';
    }

    return 'idle';
}
