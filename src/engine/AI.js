const Entity = require('./Object');

const AI = function(object)
{
    this.object = object;
    this.target = undefined;
}

AI.prototype.faceObject = function(object)
{
    this.object.direction.x = object.position.x > this.object.position.x
        ? this.object.DIRECTION_RIGHT
        : this.object.DIRECTION_LEFT;
}

AI.prototype.faceTarget = function()
{
    if (!this.target) {
        return false;
    }
    return this.faceObject(this.target);
}

AI.prototype.findPlayer = function()
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

AI.prototype.setTarget = function(object)
{
    if (object instanceof Entity !== true) {
        throw new Error("Target must be object");
    }
    this.target = object;
}

module.exports = AI;
