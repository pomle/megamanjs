const Trait = require('../Trait');

class Disappearing extends Trait
{
    constructor()
    {
        super();
        this.NAME = 'disappearing';

        this._visible = true;

        this.offDuration = 3;
        this.onDuration = 2;

        this.offset = 0;
    }
    __timeshift(deltaTime, totalTime)
    {
        const totalDuration = this.onDuration + this.offDuration;
        const modTime = (totalTime + this.offset) % totalDuration;
        if (this._visible === false && modTime > this.offDuration) {
            this.admit();
        }
        else if (this._visible === true && modTime < this.offDuration) {
            this.retract();
        }
    }
    admit()
    {
        if (this._visible) {
            return;
        }

        const h = this._host;
        this._visible = true;
        h.model.visible = true;
        h.collidable = true;

        h.animators.forEach(animator => {
            animator.reset();
        });
    }
    retract()
    {
        if (!this._visible) {
            return;
        }

        const h = this._host;
        this._visible = false;
        h.model.visible = false;
        h.collidable = false;
    }
}

module.exports = Disappearing;
