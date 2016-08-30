Game.objects.weapons.Plasma =
class Plasma extends Game.objects.Weapon
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
