Game.traits.Solid = function()
{
    Engine.Trait.call(this);

    this.attackAccept = [
        this.TOP,
        this.BOTTOM,
        this.LEFT,
        this.RIGHT
    ];

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
    if (!subject.physics) {
        return false;
    }
    if (this.ignore.has(subject)) {
        return false;
    }

    var host = this._host;

    var our = new Engine.Collision.BoundingBox(host.model, ourZone);
    var their = new Engine.Collision.BoundingBox(subject.model, theirZone);

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

    if (attack === this.TOP && subject.velocity.y < host.velocity.y) {
        their.bottom = our.top;
        subject.obstruct(host, attack);
    }
    else if (attack === this.BOTTOM && subject.velocity.y > host.velocity.y) {
        their.top = our.bottom;
        subject.obstruct(host, attack);
    }
    else if (attack === this.LEFT && subject.velocity.x > host.velocity.x) {
        their.right = our.left;
        subject.obstruct(host, attack);
    }
    else if (attack === this.RIGHT && subject.velocity.x < host.velocity.x) {
        their.left = our.right;
        subject.obstruct(host, attack);
    }

    return attack;
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
