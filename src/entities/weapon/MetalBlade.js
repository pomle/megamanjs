const Weapon = require('../Weapon');

class MetalBlade extends Weapon
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

module.exports = MetalBlade;
