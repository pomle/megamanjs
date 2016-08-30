Engine.traits.Destructible =
class Destructible extends Engine.Trait
{
    constructor()
    {
        super();

        this.NAME = 'destructible';

        this.affectors = new Set;
    }
    __collides(withObject)
    {
        if (this.affectors.has(withObject.name)) {
            this._host.removeFromWorld();
        }
    }
}
