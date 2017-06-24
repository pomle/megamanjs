const Trait = require('../Trait');

class Pickupable extends Trait
{
    constructor()
    {
        super();
        this.NAME = 'pickupable';
        this.EVENT_PICKUP = 'pickup';
        this.properties = {};
    }
}

module.exports = Pickupable;
