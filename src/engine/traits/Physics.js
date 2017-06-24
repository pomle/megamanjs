const THREE = require('three');
const Trait = require('../Trait');

class Physics extends Trait
{
    constructor()
    {
        super();

        this.NAME = 'physics';

        this.area = 0.04;
        this.atmosphericDensity = 1.225;
        this.dragCoefficient = .045;
        this.mass = 0;

        this.acceleration = new THREE.Vector2();
        this.accelerationDelta = new THREE.Vector2();
        this.force = new THREE.Vector2();
        this.velocity = new THREE.Vector2();
    }
    __obstruct(object, attack)
    {
        if (attack === object.SURFACE_TOP) {
            this.velocity.copy(object.velocity);
        } else if (attack === object.SURFACE_BOTTOM) {
            this.velocity.y = object.velocity.y;
        } else if (attack === object.SURFACE_LEFT ||
                   attack === object.SURFACE_RIGHT) {
            this._host.velocity.x = object.velocity.x;
        }
    }
    __timeshift(dt)
    {
        if (this._enabled === false || this.mass <= 0) {
            return;
        }

        const
            g = this._host.world.gravityForce,
            v = this.velocity,
            a = this.acceleration,
            å = this.accelerationDelta,
            F = this.force,
            m = this.mass;

        F.y -= g.y * m;

        const Fd = this._calculateDrag();
        F.add(Fd);
        //console.log("Force: %f,%f, Resistance: %f,%f, Result: %f,%f", F.x, F.y, Fd.x, Fd.y, F.x - Fd.x, F.y - Fd.y);

        å.set(F.x / m, F.y / m);
        a.copy(å);
        v.add(a);

        this._host.velocity.copy(v);

        F.x = 0;
        F.y = 0;
    }
    _calculateDrag()
    {
        const
            ρ = this.atmosphericDensity,
            Cd = this.dragCoefficient,
            A = this.area,
            v = this._host.velocity;
        /* abs value for one velocity component to circumvent
           signage removal on v^2 . */
        return new THREE.Vector2(-.5 * ρ * Cd * A * v.x * Math.abs(v.x),
                                 -.5 * ρ * Cd * A * v.y * Math.abs(v.y));
    }
    bump(x, y)
    {
        this.velocity.x += x;
        this.velocity.y += y;
    }
    reset()
    {
        this.zero();
    }
    zero()
    {
        this.velocity.set(0, 0, 0);
        this._host.velocity.copy(this.velocity);
        this._host.integrator.reset();
    }
}

module.exports = Physics;
