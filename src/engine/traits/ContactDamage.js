Engine.traits.ContactDamage = function()
{
    Engine.Trait.call(this);
    this.points = 0;
}

Engine.Util.extend(Engine.traits.ContactDamage, Engine.Trait);

Engine.traits.ContactDamage.prototype.NAME = 'contactDamage';
Engine.traits.ContactDamage.prototype.EVENT_CONTACT_DAMAGE = 'contact-damage';

Engine.traits.ContactDamage.prototype.__collides = function(withObject, ourZone, theirZone)
{
    if (this.points !== 0 && withObject.health) {
        var direction = this._host.position.clone().sub(withObject.position);
        withObject.inflictDamage(this.points, direction);
        withObject.trigger(this.EVENT_CONTACT_DAMAGE);
    }
}
