Engine.objects.weapons.TimeStopper =
class TimeStopper extends Engine.objects.Weapon
{
    constructor()
    {
        super();
        this.ammo.max = 30; // Seconds of real time it lasts.
        this.cost = 1;
        this.dilation = 0.01;
        this.dilated = false;
    }
    fire()
    {
        if (!super.fire()) {
            return false;
        }
        if (this.dilated) {
            this.resetTime();
        }
        else {
            this.distortTime();
        }
        return true;
    }
    distortTime()
    {
        this.user.world.timeStretch *= this.dilation;
        this.user.timeStretch /= this.dilation;
        this.dilated = true;
    }
    resetTime()
    {
        this.user.world.timeStretch /= this.dilation;
        this.user.timeStretch *= this.dilation;
        this.dilated = false;
    }
    timeShift(dt)
    {
        if (this.dilated) {
            this.ammo.amount -= this.cost * this.user.deltaTime;
            if (this.user.dead || this.ammo.depleted) {
                this.resetTime();
            }
        }
        super.timeShift(dt);
    }
}
