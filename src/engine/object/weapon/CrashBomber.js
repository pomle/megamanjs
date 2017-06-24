const Weapon = require('../Weapon');

class CrashBomber extends Weapon
{
    fire()
    {
        if (!super.fire()) {
            return false;
        }
        const projectile = this.getProjectile();
        this.emit(projectile);
        return true;
    }
}

module.exports = CrashBomber;
