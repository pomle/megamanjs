Engine.objects.weapons.CrashBomber =
class CrashBomber extends Engine.objects.Weapon
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
