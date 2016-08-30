Engine.traits.Pickupable = function()
{
    Engine.Trait.call(this);
    this.properties = {};
}

Engine.Util.extend(Engine.traits.Pickupable, Engine.Trait, {
    NAME: 'pickupable',
    EVENT_PICKUP: 'pickup',
});
