import Entity from '../../Object';

class Megaman extends Entity
{
    constructor() {
        super();
        this.events.bind(this.EVENT_TRAIT_ATTACHED, trait => {
          if (trait.NAME === 'weapon') {
              this.events.bind(trait.EVENT_EQUIP, this.changeDress);
          }
        });
    }
    changeDress(weapon)
    {
        const textureId = "megaman-" + weapon.code;
        if (this.textures[textureId]) {
            this.model.material.map = this.textures[textureId].texture;
            this.model.material.needsUpdate = true;
        }
    }
}

export default Megaman;
