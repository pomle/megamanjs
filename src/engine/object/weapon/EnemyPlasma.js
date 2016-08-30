Game.objects.weapons.EnemyPlasma =
class EnemyPlasma extends Game.objects.Weapon
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
