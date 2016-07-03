'use strict';

Game.traits.Climber =
class Climber extends Engine.Trait
{
    constructor()
    {
        super();

        this.NAME = 'climber';

        this.attached = undefined;
        this.bounds = {
            climbable: undefined,
            host: undefined,
        };

        this.speed = 60;

        this.thresholds = {
            top: 0,
            bottom: 0,
            left: 0,
            right: 0,
        };
    }
    __collides(subject, ourZone, theirZone)
    {
        /* Don't regrab anything in the middle of climbing. */
        if (this.attached !== undefined) {
            return;
        }

        /* Don't grab anything without climbable trait. */
        if (subject.climbable === undefined) {
            return;
        }

        this.grab(subject, ourZone, theirZone);
    }
    __obstruct(object, attack)
    {
        /* If we touch ground, release climbable. */
        if (this._host.aim.y < 0 && attack === object.SURFACE_TOP) {
            this.release();
        }
    }
    __timeshift(deltaTime)
    {
        if (this.attached === undefined) {
            return;
        }

        const host = this._host;
        if (host.physics) {
            host.physics.zero();
        }

        host.velocity.copy(host.aim).setLength(this.speed);
        host.velocity.add(this.attached.velocity);

        if (host.aim.y > 0 && host.position.y > this.bounds.climbable.top - this.thresholds.top) {
            this.bounds.host.bottom = this.bounds.climbable.top;
            this.release();
            return;
        }

        this.constrain();
    }
    constrain()
    {
        const subject = this._host;
        const climbable = this.bounds.climbable;
        const thresh = this.thresholds;

        if (subject.position.x > climbable.right + thresh.right) {
            subject.position.x = climbable.right + thresh.right;
        } else if (subject.position.x < climbable.left - thresh.left) {
            subject.position.x = climbable.left - thresh.left;
        }

        if (subject.position.y > climbable.top - thresh.top) {
            subject.position.y = climbable.top - thresh.top;
        } else if (subject.position.y < climbable.bottom + thresh.bottom) {
            subject.position.y = climbable.bottom + thresh.bottom;
        }
    }
    grab(subject, ourZone, theirZone)
    {
        this.release();

        /* Don't grab ladder unless going up or down. */
        const host = this._host;
        if (host.aim.y === 0) {
            return false;
        }

        /* Don't grab ladder if going down and is on the ground. */
        if (host.aim.y < 0 && host.jump && host.jump._ready === true) {
            return false;
        }

        /* Don't grab ladder if on top and push up. */
        if (host.aim.y > 0) {
            if (host.position.y > theirZone.top - this.thresholds.top) {
                return false;
            }
        }

        this.bounds.climbable = theirZone;
        this.bounds.host = ourZone;

        this.attached = subject;
        this.attached.climbable.attach(host);

        this.constrain();

        return true;
    }
    release()
    {
        if (this.attached === undefined) {
            return;
        }
        const host = this._host;
        this.bounds.climbable = undefined;
        this.bounds.host = undefined;
        this.attached.climbable.detach(host);
        this.attached = undefined;
        if (host.physics) {
            host.physics.zero();
        }
    }
}
