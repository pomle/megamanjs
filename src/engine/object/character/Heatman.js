import Entity from '../../Object';

class Heatman extends Entity
{
    constructor() {
        super();
        this.flameTransformDuration = .09;
        this.flameTransformTime = 0;
    }
    routeAnimation()
    {
        if (this.move._interimSpeed) {
            if (this.flameTransformTime < this.flameTransformDuration) {
                this.flameTransformTime += this.deltaTime;
                return 'toFlame';
            }
            this.flameTransformTime = this.flameTransformDuration;
            return 'flame';
        }
        else {
            if (this.isFiring) {
                return 'fire';
            }

            if (!this.jump._ready) {
                return 'jump';
            }

            if (this.isInvincible) {
                return 'burn';
            }
            if (this.flameTransformTime > 0) {
                this.flameTransformTime -= this.deltaTime;
                return 'fromFlame';
            }
            this.flameTransformTime = 0;
            return 'idle';
        }
    }

    timeShift(dt)
    {
        if (this.move._walkSpeed === 0) {
            this.health.immune = false;
        }
        else {
            this.health.immune = true;
        }

        super.timeShift(dt);
    }
}

export default Heatman;
