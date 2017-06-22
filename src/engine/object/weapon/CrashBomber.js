import Weapon from '../Weapon';

class CrashBomber extends Weapon
{
    fire()
    {
        if (!super.fire()) {
            return false;
        }
        var projectile = this.getProjectile();
        this.emit(projectile);
        return true;
    }
}

export default CrashBomber;
