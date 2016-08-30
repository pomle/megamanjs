Engine.AI = function(object)
{
    this.object = object;
    this.target = undefined;
}

Engine.AI.prototype.faceObject = function(object)
{
    this.object.direction.x = object.position.x > this.object.position.x
        ? this.object.DIRECTION_RIGHT
        : this.object.DIRECTION_LEFT;
}

Engine.AI.prototype.faceTarget = function()
{
    if (!this.target) {
        return false;
    }
    return this.faceObject(this.target);
}

Engine.AI.prototype.findPlayer = function()
{
    if (this.target && this.target.isPlayer) {
        return this.target;
    }

    var objects = this.object.world.objects;
    for (var i = 0, l = objects.length; i !== l; ++i) {
        if (objects[i] !== undefined) {
            var o = objects[i];
            if (o.isPlayer) {
                this.setTarget(o);
                return o;
            }
        }
    }
    return false;
}

Engine.AI.prototype.setTarget = function(object)
{
    if (object instanceof Engine.Object !== true) {
        throw new Error("Target must be object");
    }
    this.target = object;
}
