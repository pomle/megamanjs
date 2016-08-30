'use strict';

Engine.traits.Solid =
class Solid extends Engine.Trait
{
    constructor()
    {
        super();

        this.NAME = 'solid';

        const SIDES = Engine.traits.Solid.SIDES;
        this.TOP = SIDES.TOP;
        this.BOTTOM = SIDES.BOTTOM;
        this.LEFT = SIDES.LEFT;
        this.RIGHT = SIDES.RIGHT;

        this.attackAccept = [
            this.TOP,
            this.BOTTOM,
            this.LEFT,
            this.RIGHT,
        ];

        this.fixed = false;
        this.obstructs = false;

        this.ignore = new Set();
    }
    __collides(subject, ourZone, theirZone)
    {
        if (!subject.solid) {
            return false;
        }
        if (this.ignore.has(subject)) {
            return false;
        }

        const host = this._host;

        const attack = this.attackDirection(ourZone, theirZone);

        if (this.attackAccept.indexOf(attack) < 0) {
            /*
            Collision is detected on a surface that should not obstruct.
            This puts this host in the ignore list until uncollides callback
            has been reached.
            */
            this.ignore.add(subject);
            return false;
        }

        if (this.obstructs) {
            const s = subject.velocity;
            const h = host.velocity;
            const affect = (attack === this.TOP && s.y < h.y) ||
                           (attack === this.BOTTOM && s.y > h.y) ||
                           (attack === this.LEFT && s.x > h.x) ||
                           (attack === this.RIGHT && s.x < h.x);

            if (affect === true) {
                subject.obstruct(host, attack, ourZone, theirZone);
            }
        }

        return attack;
    }
    __obstruct(object, attack, ourZone, theirZone)
    {
        if (this.fixed === true) {
            return;
        }
        if (attack === object.SURFACE_TOP) {
            theirZone.bottom = ourZone.top;
        } else if (attack === object.SURFACE_BOTTOM) {
            theirZone.top = ourZone.bottom;
        } else if (attack === object.SURFACE_LEFT) {
            theirZone.right = ourZone.left;
        } else if (attack === object.SURFACE_RIGHT) {
            theirZone.left = ourZone.right;
        }
    }
    __uncollides(subject, ourZone, theirZone)
    {
        this.ignore.delete(subject);
    }
    attackDirection(ourBounds, theirBounds)
    {
        const distances = [
            Math.abs(theirBounds.bottom - ourBounds.top),
            Math.abs(theirBounds.top - ourBounds.bottom),
            Math.abs(theirBounds.right - ourBounds.left),
            Math.abs(theirBounds.left - ourBounds.right),
        ];

        let dir = 0, l = 4, min = distances[dir];
        for (let i = 1; i < l; ++i) {
            if (distances[i] < min) {
                min = distances[i];
                dir = i;
            }
        }

        return dir;
    }
}

Engine.traits.Solid.SIDES = {
    TOP: Engine.Object.prototype.SURFACE_TOP,
    BOTTOM: Engine.Object.prototype.SURFACE_BOTTOM,
    LEFT: Engine.Object.prototype.SURFACE_LEFT,
    RIGHT: Engine.Object.prototype.SURFACE_RIGHT,
};
