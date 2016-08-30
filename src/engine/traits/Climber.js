Engine.traits.Climber =
class Climber extends Engine.Trait
{
    constructor()
    {
        super();

        this.NAME = 'climber';

        this.attached = null;
        this.bounds = {
            climbable: null,
            host: null,
        };

        this.speed = 60;

        this.thresholds = {
            top: 2,
            bottom: 2,
            left: 0,
            right: 0,
        };
    }
    __collides(subject, ourZone, theirZone)
    {
        /* Don't regrab anything in the middle of climbing. */
        if (this.attached) {
            return;
        }

        /* Don't grab anything without climbable trait. */
        if (!subject.climbable) {
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
        if (!this.attached) {
            return;
        }

        const host = this._host;

        if (host.aim.y > 0 && host.position.y > this.bounds.climbable.top - this.thresholds.top) {
            this.bounds.host.bottom = this.bounds.climbable.top;
            this.release();
            if (host.jump) {
                host.jump.reset();
            }
            return;
        } else if (host.aim.y < 0 && this.bounds.host.top < this.bounds.climbable.bottom) {
            this.release();
            return;
        }

        if (host.physics) {
            host.physics.zero();
        }

        host.velocity.copy(host.aim).setLength(this.speed);
        host.velocity.add(this.attached.velocity);

        this.constrain();
    }
    constrain()
    {
        const pos = this._host.position;
        const cli = this.bounds.climbable;
        const thr = this.thresholds;

        if (pos.y > cli.top - thr.top) {
            pos.y = cli.top - thr.top;
        }

        pos.x = this.attached.position.x;
    }
    grab(subject, me, climbable)
    {
        this.release();

        /* Don't grab ladder unless going up or down. */
        const host = this._host;
        if (host.aim.y === 0) {
            return false;
        }

        /* Don't grab ladder if on top and push up. */
        if (host.aim.y > 0) {
            if (host.position.y > climbable.top - this.thresholds.top) {
                return false;
            }
        }

        /* Don't grab ladder if going aiming down and not on top. */
        if (host.aim.y < 0 && me.bottom <= climbable.top - this.thresholds.top) {
            return false;
        }

        if (host.move) {
            host.move.disable();
        }

        this.bounds.climbable = climbable;
        this.bounds.host = me;

        this.attached = subject;
        this.attached.climbable.attach(host);

        this.constrain();

        return true;
    }
    release()
    {
        if (!this.attached) {
            return;
        }
        const host = this._host;
        if (host.move) {
            host.move.enable();
        }
        this.bounds.climbable = null;
        this.bounds.host = null;
        this.attached.climbable.detach(host);
        this.attached = null;
        if (host.physics) {
            host.physics.zero();
        }
    }
    reset()
    {
        this.release();
    }
}
