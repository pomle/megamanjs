Game.traits.Solid = function()
{
    Engine.Trait.call(this);

    this.attackAccept = [
        this.TOP,
        this.BOTTOM,
        this.LEFT,
        this.RIGHT
    ];

    this.fixed = false;
    this.obstructs = false;

    this.ignore = new Set();
}

Engine.Util.extend(Game.traits.Solid, Engine.Trait);

Game.traits.Solid.prototype.NAME = 'solid';

Game.traits.Solid.prototype.TOP = Engine.Object.prototype.SURFACE_TOP;
Game.traits.Solid.prototype.BOTTOM = Engine.Object.prototype.SURFACE_BOTTOM;
Game.traits.Solid.prototype.LEFT = Engine.Object.prototype.SURFACE_LEFT;
Game.traits.Solid.prototype.RIGHT = Engine.Object.prototype.SURFACE_RIGHT;

Game.traits.Solid.prototype.__collides = function(subject, ourZone, theirZone)
{
    if (!subject.solid) {
        return false;
    }
    if (this.ignore.has(subject)) {
        return false;
    }

    var host = this._host;

    var our = new Engine.Collision.BoundingBox(host, ourZone);
    var their = new Engine.Collision.BoundingBox(subject, theirZone);

    var attack = this.attackDirection(our, their);

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
        var affect = (attack === this.TOP && subject.velocity.y < host.velocity.y) ||
                     (attack === this.BOTTOM && subject.velocity.y > host.velocity.y) ||
                     (attack === this.LEFT && subject.velocity.x > host.velocity.x) ||
                     (attack === this.RIGHT && subject.velocity.x < host.velocity.x);

        if (affect === true) {
            subject.obstruct(host, attack, our, their);
        }
    }

    return attack;
}

Game.traits.Solid.prototype.__obstruct = function(object, attack, ourZone, theirZone)
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

Game.traits.Solid.prototype.__uncollides = function(subject, ourZone, theirZone)
{
    this.ignore.delete(subject);
}

Game.traits.Solid.prototype.attackDirection = function(ourBounds, theirBounds)
{
    var distances = [
        Math.abs(theirBounds.bottom - ourBounds.top),
        Math.abs(theirBounds.top - ourBounds.bottom),
        Math.abs(theirBounds.right - ourBounds.left),
        Math.abs(theirBounds.left - ourBounds.right),
    ];

    var dir = 0, l = 4, min = distances[dir];
    for (var i = 1; i < l; ++i) {
        if (distances[i] < min) {
            min = distances[i];
            dir = i;
        }
    }

    return dir;
}
