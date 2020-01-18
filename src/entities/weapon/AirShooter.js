const Weapon = require('../Weapon');

class AirShooter extends Weapon
{
    constructor()
    {
        super();
        this.speed = 80;
    }
    fire()
    {
        if (!super.fire()) {
            return false;
        }

        const velocityMultiplier = 1.2;
        let count = 0;
        let projectile;
        while (projectile = this.getProjectile()) {
            projectile.projectile._speed = this.speed * Math.pow(velocityMultiplier, count++);
            this.emit(projectile);
        }

        return true;
    }
}

module.exports = AirShooter;
