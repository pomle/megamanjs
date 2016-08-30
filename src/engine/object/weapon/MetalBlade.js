Engine.objects.weapons.MetalBlade =
class MetalBlade extends Engine.objects.Weapon
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
