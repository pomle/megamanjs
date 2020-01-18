const {Entity} = require('@snakesilk/engine');

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
        const textureId = 'megaman-' + weapon.code;
        this.useTexture(textureId);
    }
}

module.exports = Megaman;
