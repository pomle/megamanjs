import Entity from '../../Object';

class SniperArmor extends Entity
{
    constructor() {
        super();
        this.ai = new Engine.AI(this);

        this.airTime = 0;
        this.groundTime = 0;
        this.jumpCoolDown = 0;
        this.isJumpCharged = 0;
        this.timeAIUpdated = null;
    }

    routeAnimation()
    {
        if (!this.jump._ready) {
            return 'jumping';
        }
        if (this.jumpCharging || this.groundTime < .1) {
            return 'charging';
        }
        return 'idle';
    }

    updateAI()
    {
        if (Math.abs(this.time - this.timeAIUpdated) < 2) {
            return;
        }

        this.timeAIUpdated = this.time;

        if (this.ai.findPlayer()) {
            if (this.ai.target.position.distanceTo(this.position) > 300) {
                return;
            }
            this.ai.faceTarget();
            if (this.jumpCoolDown > 0) {
                return false;
            }
            this.jumpCoolDown = 4;
            this.jumpCharging = .5;
            this.isJumpCharged = false;
        }
    }

    timeShift(dt)
    {
        this.updateAI(dt);

        if (this.jumpCharging) {
            this.jumpCharging -= dt;
            if (this.jumpCharging <= 0) {
                this.jumpCharging = false;
                this.isJumpCharged = true;
            }
        }

        if (this.isJumpCharged) {
            this.jump.engage();
            this.isJumpCharged = false;
            this.jumpCoolDown = 2.5;
        }

        if (this.jumpCoolDown > 0) {
            this.jumpCoolDown -= dt;
            if (this.jumpCoolDown <= 0) {
                this.jumpCoolDown = 0;
            }
        }

        if (this.jump._ready) {
            this.groundTime += dt;
            this.airTime = 0;
        }
        else {
            this.airTime += dt;
            this.groundTime = 0;
        }

        super.timeShift(dt);
    }
}

export default SniperArmor;
