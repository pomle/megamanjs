Game.objects.obstacles.AppearingSolid = function()
{
    Game.objects.Solid.call(this);
    this.timeOffset = 0;
    this.timeVisible = 1;
    this.timeInvisible = 3;
}

Game.objects.obstacles.AppearingSolid.prototype = Object.create(Game.objects.Solid.prototype);
Game.objects.obstacles.AppearingSolid.constructor = Game.objects.obstacles.AppearingSolid;

Game.objects.obstacles.AppearingSolid.prototype.collides = function(withObject, ourZone, theirZone)
{
    if (this.model.visible) {
        Game.objects.Solid.prototype.collides.call(this, withObject, ourZone, theirZone);
    }
}

Game.objects.obstacles.AppearingSolid.prototype.timeShift = function(dt)
{
    Game.objects.Solid.prototype.timeShift.call(this, dt);
    var time = this.time + this.timeOffset;
    this.model.visible = (time % (this.timeVisible + this.timeInvisible)) < this.timeVisible;
}
