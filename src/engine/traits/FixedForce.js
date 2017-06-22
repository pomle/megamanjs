import {Vector2} from 'three';
import Trait from '../Trait';

class FixedForce extends Trait
{
    constructor()
    {
        super();
        this.NAME = 'fixedForce';
        this.force = new Vector2;
    }
    __timeshift(dt)
    {
        const v = this._host.velocity;
        const f = this.force;
        v.x += f.x * dt;
        v.y += f.y * dt;
    }
}

export default FixedForce;
