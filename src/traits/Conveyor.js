const {Vector2} = require('three');
const {Solid} = require('@snakesilk/platform-traits');

class Conveyor extends Solid
{
    constructor()
    {
        super();
        this.NAME = 'conveyor';
        this.velocity = new Vector2(40, 0);
        this.fixed = true;
        this.obstructs = true;
    }
    __collides(subject)
    {
        if (!subject.physics) {
            return;
        }

        const attack = super.__collides(...arguments);
        if (attack === this.TOP) {
            subject.physics.velocity.add(this.velocity);
        }
    }
    swapDirection()
    {
        const dir = this._host.direction;
        const vel = this.velocity;
        dir.x = -dir.x;
        vel.x = -vel.x;
    }
}

module.exports = Conveyor;
