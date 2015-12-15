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
