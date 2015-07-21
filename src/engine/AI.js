Engine.AI = function(object)
{
    this.object = object;
    this.target = undefined;
}

Engine.AI.prototype.faceObject = function(object)
{
    this.object.setDirection(object.position.x > this.object.position.x
                             ? this.object.RIGHT
                             : this.object.LEFT);
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
        return true;
    }

    for (var o of this.object.scene.objects) {
        if (o.isPlayer) {
            this.setTarget(o);
            return true;
        }
    }
    return false;
}

Engine.AI.prototype.setTarget = function(object)
{
    if (object instanceof Engine.assets.Object !== true) {
        throw new Error("Target must be object");
    }
    this.target = object;
}
