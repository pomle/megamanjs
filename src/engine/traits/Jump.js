const THREE = require('three');
const Trait = require('../Trait');

class Jump extends Trait
{
    constructor()
    {
        super();

        this.NAME = 'jump';
        this.EVENT_JUMP_ENGAGE = 'jump-engage';
        this.EVENT_JUMP_CANCEL = 'jump-cancel';
        this.EVENT_JUMP_END    = 'jump-end';
        this.EVENT_JUMP_LAND    = 'jump-land';

        this._fallcount = 0;

        this._elapsed = undefined;
        this._bump = new THREE.Vector2();
        this._ready = false;

        this.duration = .18;
        this.force = new THREE.Vector2(0, 100);
    }
    __obstruct(object, attack)
    {
        if (!this._enabled) {
            return;
        }

        if (attack === object.SURFACE_TOP) {
            if (this._ready === false) {
                this._trigger(this.EVENT_JUMP_LAND);
            }
            this.reset();
        } else if (attack === object.SURFACE_BOTTOM) {
            this._end();
        }
    }
    __timeshift(deltaTime)
    {
        if (!this._enabled) {
            return;
        }

        if (++this._fallcount >= 2) {
            this._ready = false;
        }

        if (this._elapsed === undefined) {
            return;
        } else if (this._elapsed >= this.duration) {
            this._end();
        } else {
            this._elapsed += deltaTime;
        }
    }
    _end()
    {
        this._elapsed = undefined;
        this._trigger(this.EVENT_JUMP_END);
    }
    engage()
    {
        if (!this._enabled) {
            return;
        }

        const host = this._host;

        if (host.climber !== undefined) {
            host.climber.release();
        }

        if (!this._ready) {
            return false;
        }

        this._bump.copy(this.force);
        this._bump.x *= host.direction.x;
        this._host.physics.velocity.add(this._bump);
        this._elapsed = 0;

        /* Immediately express "falling" state on jump. */
        this._fallcount = 2;

        this._trigger(this.EVENT_JUMP_ENGAGE);
    }
    cancel()
    {
        if (this._elapsed !== undefined) {
            const progress = (this.duration - this._elapsed) / this.duration;
            this._host.physics.velocity.y -= this.force.y * progress * .8;
            this._trigger(this.EVENT_JUMP_CANCEL);
        }
        this._end();
    }
    reset()
    {
        this._ready = true;
        this._fallcount = 0;
    }
}

module.exports = Jump;
