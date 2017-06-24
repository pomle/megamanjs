const Solid = require('./Solid');

class Climbable extends Solid
{
    constructor()
    {
        super();
        this.NAME = 'climbable';
        this.attackAccept = [this.TOP];
        this.fixed = true;
        this.obstructs = true;
    }
    __uncollides(subject)
    {
        if (subject.climber && subject.climber.attached === this._host) {
            subject.climber.release();
        }
        super.__uncollides(subject);
    }
    attach(subject)
    {
        this.ignore.add(subject);
    }
    detach(subject)
    {
        this.ignore.delete(subject);
    }
}

module.exports = Climbable;
