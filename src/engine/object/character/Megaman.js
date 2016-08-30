Game.objects.characters.Megaman = function()
{
    Engine.Object.call(this);

    this.events.bind(Game.traits.Weapon.prototype.EVENT_EQUIP, this.changeDress);
}

Engine.Util.extend(Game.objects.characters.Megaman,
                   Engine.Object);

Game.objects.characters.Megaman.prototype.changeDress = function(weapon)
{
    var textureId = "megaman-" + weapon.code;
    if (this.textures[textureId]) {
        this.model.material.map = this.textures[textureId].texture;
        this.model.material.needsUpdate = true;
    }
}
