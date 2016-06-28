Game.objects.weapons.AirShooter =
class AirShooter extends Game.objects.Weapon
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
        const count = 0;
        let projectile;
        while (projectile = this.getProjectile()) {
            projectile.setSpeed(this.speed * Math.pow(velocityMultiplier, count++));
            this.emit(projectile);
        }

        return true;
    }
}
