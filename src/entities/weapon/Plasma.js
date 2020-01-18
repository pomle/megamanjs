const Weapon = require('../Weapon');

class Plasma extends Weapon
{
    fire()
    {
        if (!super.fire()) {
            return false;
        }

        this.emit(this.projectilesIdle[0]);
        return true;
    }
}

module.exports = Plasma;
