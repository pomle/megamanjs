import Trait from '../Trait';

class Lifetime extends Trait
{
    constructor()
    {
        super();
        this.NAME = 'lifetime';

        this._time = 0;
        this.duration = Infinity;
    }
    __timeshift(dt)
    {
        if (this._time > this.duration) {
            const host = this._host;
            host.world.removeObject(host);
        } else {
            this._time += dt;
        }
    }
    reset()
    {
        this._time = 0;
    }
}

export default Lifetime;
