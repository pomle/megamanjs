const {Vector2} = require('three');
const Trait = require('../Trait');

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

module.exports = FixedForce;
