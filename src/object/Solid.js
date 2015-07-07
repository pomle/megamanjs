Engine.assets.Solid = function()
{
    Engine.assets.Object.call(this);

    this.attackAccept = [
        this.TOP,
        this.BOTTOM,
        this.LEFT,
        this.RIGHT
    ];

    this.ignore = [];
}

Engine.assets.Solid.prototype = Object.create(Engine.assets.Object.prototype);
Engine.assets.Solid.constructor = Engine.assets.Solid;

Engine.assets.Solid.prototype.TOP = 0;
Engine.assets.Solid.prototype.BOTTOM = 1;
Engine.assets.Solid.prototype.LEFT = 2;
Engine.assets.Solid.prototype.RIGHT = 3;


Engine.assets.Solid.prototype.attackDirection = function(ourBoundingBox, theirBoundingBox)
{
    var distances = [
        Math.abs(theirBoundingBox.b - ourBoundingBox.t),
        Math.abs(theirBoundingBox.t - ourBoundingBox.b),
        Math.abs(theirBoundingBox.r - ourBoundingBox.l),
        Math.abs(theirBoundingBox.l - ourBoundingBox.r),
    ];

    var dir = 0, l = 4, min = distances[dir];
    for (var i = 1; i < l; i++) {
        if (distances[i] < min) {
            min = distances[i];
            dir = i;
        }
    }

    return dir;
}

Engine.assets.Solid.prototype.collides = function(subject, ourZone, theirZone)
{
    if (subject instanceof Engine.assets.objects.Character === false) {
        return false;
    }
    if (this.ignore.indexOf(subject) > -1) {
        return false;
    }

    var our = new Engine.Collision.BoundingBox(this.model, ourZone);
    var their = new Engine.Collision.BoundingBox(subject.model, theirZone);

    const attack = this.attackDirection(our, their);

    if (this.attackAccept.indexOf(attack) < 0) {
        /*
        Collision is detected on a surface that should not obstruct.
        This puts this object in the ignore list until uncollides callback
        has been reached.
        */
        this.ignore.push(subject);
        return false;
    }

    if (attack === this.TOP && subject.velocity.y < this.velocity.y) {
        their.bottom(our.t);
        subject.obstruct(this, attack);
    }
    else if (attack === this.BOTTOM && subject.velocity.y > this.velocity.y) {
        their.top(our.b);
        subject.obstruct(this, attack);
    }
    else if (attack === this.LEFT && subject.velocity.x > this.velocity.x) {
        their.right(our.l);
        subject.obstruct(this, attack);
    }
    else if (attack === this.RIGHT && subject.velocity.x < this.velocity.x) {
        their.left(our.r);
        subject.obstruct(this, attack);
    }

    return true;
}

Engine.assets.Solid.prototype.uncollides = function(subject, ourZone, theirZone)
{
    var i = this.ignore.indexOf(subject);
    if (i > -1) {
        this.ignore.splice(i, 1);
    }
}

Engine.assets.obstacles = {};
