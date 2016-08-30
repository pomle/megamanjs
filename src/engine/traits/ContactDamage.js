Engine.traits.ContactDamage =
class ContactDamage extends Engine.Trait
{
    constructor()
    {
        super();

        this.NAME = 'contactDamage';
        this.EVENT_CONTACT_DAMAGE = 'contact-damage';

        this.points = 0;
    }
    __collides(withObject, ourZone, theirZone)
    {
        if (this.points !== 0 && withObject.health) {
            const direction = this._host.position.clone().sub(withObject.position);
            withObject.health.inflictDamage(this.points, direction);
            withObject.events.trigger(this.EVENT_CONTACT_DAMAGE, [this.points, direction]);
        }
    }
}
