Game.objects.characters.Megaman = function()
{
    Game.objects.Character.call(this);

    this.bind(Game.traits.Weapon.prototype.EVENT_EQUIP, this.changeDress);
    this.bind(Game.traits.Health.prototype.EVENT_HURT, this.damage);
}

Engine.Util.extend(Game.objects.characters.Megaman,
                   Game.objects.Character);

Game.objects.characters.Megaman.prototype.changeDress = function(weapon)
{
    var textureId = "megaman-" + weapon.code;
    if (this.textures[textureId]) {
        this.model.material.map = this.textures[textureId].texture;
        this.model.material.needsUpdate = true;
    }
}
