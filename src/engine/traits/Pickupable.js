Engine.traits.Pickupable =
class Pickupable extends Engine.Trait
{
    constructor()
    {
        super();
        this.NAME = 'pickupable';
        this.EVENT_PICKUP = 'pickup',
        this.properties = {};
    }
}
