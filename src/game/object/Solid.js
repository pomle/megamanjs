Game.objects.Solid = function()
{
    Engine.Object.call(this);

    this.attackAccept = [
        this.TOP,
        this.BOTTOM,
        this.LEFT,
        this.RIGHT
    ];

    this.ignore = new Set();
}

Game.objects.Solid.prototype = Object.create(Engine.Object.prototype);
Game.objects.Solid.constructor = Game.objects.Solid;

Game.objects.Solid.prototype.TOP = 0;
Game.objects.Solid.prototype.BOTTOM = 1;
Game.objects.Solid.prototype.LEFT = 2;
Game.objects.Solid.prototype.RIGHT = 3;


Game.objects.Solid.prototype.attackDirection = function(ourBoundingBox, theirBoundingBox)
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

Game.objects.Solid.prototype.collides = function(subject, ourZone, theirZone)
{
    if (!subject.physics) {
        return false;
    }
    if (!subject.obstructible) {
        return false;
    }
    if (this.ignore.has(subject)) {
        return false;
    }

    var our = new Engine.Collision.BoundingBox(this.model, ourZone);
    var their = new Engine.Collision.BoundingBox(subject.model, theirZone);

    var attack = this.attackDirection(our, their);

    if (this.attackAccept.indexOf(attack) < 0) {
        /*
        Collision is detected on a surface that should not obstruct.
        This puts this object in the ignore list until uncollides callback
        has been reached.
        */
        this.ignore.add(subject);
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

Game.objects.Solid.prototype.uncollides = function(subject, ourZone, theirZone)
{
    this.ignore.delete(subject);
}

Game.objects.obstacles = {};
