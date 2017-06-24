const {Vector2} = require('three');
const Trait = require('../Trait');

class Translating extends Trait
{
    constructor()
    {
        super();
        this.NAME = 'translating';

        this.func = undefined;
        this.amplitude = new Vector2(1, 1);
        this.speed = 1;
    }
    __timeshift(deltaTime, totalTime)
    {
        switch (this.func) {
        case 'linear':
            return this.linear.apply(this, arguments);
        case 'oscillate':
            return this.oscillate.apply(this, arguments);
        }
    }
    linear(deltaTime, totalTime)
    {
        const v = this._host.velocity;
        v.x = this.amplitude.x * this.speed;
        v.y = this.amplitude.y * this.speed;
    }
    oscillate(deltaTime, totalTime)
    {
        const
            v = this._host.velocity,
            s = this.speed,
            t = totalTime + deltaTime / 2;

        v.x = Math.sin(t * s) * this.amplitude.x * s;
        v.y = Math.cos(t * s) * this.amplitude.y * s;
    }
}

module.exports = Translating;
