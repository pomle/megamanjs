const Weapon = require('../Weapon');

class EnemyPlasma extends Weapon
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

module.exports = EnemyPlasma;
