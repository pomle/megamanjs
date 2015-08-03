Engine.traits.ContactDamage = function()
{
    Engine.Trait.call(this);
    this.points = 0;
}

Engine.Util.extend(Engine.traits.ContactDamage, Engine.Trait);

Engine.traits.ContactDamage.prototype.EVENT_CONTACT_DAMAGE = 'contact-damage';

Engine.traits.ContactDamage.prototype.__collides = function(withObject, ourZone, theirZone)
{
    if (this.points !== 0 && withObject.health) {
        withObject.inflictDamage(this.points);
        withObject.trigger(this.EVENT_CONTACT_DAMAGE);
    }
}
