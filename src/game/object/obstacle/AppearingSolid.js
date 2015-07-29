Engine.assets.obstacles.AppearingSolid = function()
{
    Engine.assets.Solid.call(this);
    this.timeOffset = 0;
    this.timeVisible = 1;
    this.timeInvisible = 3;
}

Engine.assets.obstacles.AppearingSolid.prototype = Object.create(Engine.assets.Solid.prototype);
Engine.assets.obstacles.AppearingSolid.constructor = Engine.assets.obstacles.AppearingSolid;

Engine.assets.obstacles.AppearingSolid.prototype.collides = function(withObject, ourZone, theirZone)
{
    if (this.model.visible) {
        Engine.assets.Solid.prototype.collides.call(this, withObject, ourZone, theirZone);
    }
}

Engine.assets.obstacles.AppearingSolid.prototype.timeShift = function(dt)
{
    Engine.assets.Solid.prototype.timeShift.call(this, dt);
    var time = this.time + this.timeOffset;
    this.model.visible = (time % (this.timeVisible + this.timeInvisible)) < this.timeVisible;
}
