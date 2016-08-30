Engine.objects.characters.Megaman = function()
{
    Engine.Object.call(this);

    this.events.bind(this.EVENT_TRAIT_ATTACHED, trait => {
      if (trait.NAME === 'weapon') {
          this.events.bind(trait.EVENT_EQUIP, this.changeDress);
      }
    });
}

Engine.Util.extend(Engine.objects.characters.Megaman,
                   Engine.Object);

Engine.objects.characters.Megaman.prototype.changeDress = function(weapon)
{
    var textureId = "megaman-" + weapon.code;
    if (this.textures[textureId]) {
        this.model.material.map = this.textures[textureId].texture;
        this.model.material.needsUpdate = true;
    }
}
