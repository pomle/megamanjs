Engine.assets.obstacles.Ladder = function()
{
    Engine.assets.Solid.call(this);
    this.attackAccept = [this.TOP];
}

Engine.assets.obstacles.Ladder.prototype = Object.create(Engine.assets.Solid.prototype);
Engine.assets.obstacles.Ladder.constructor = Engine.assets.obstacles.Ladder;

Engine.assets.obstacles.Ladder.prototype.collides = function(withObject, ourZone, theirZone)
{

}
