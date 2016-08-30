Engine.objects.obstacles.Ladder = function()
{
    Engine.objects.Solid.call(this);
    this.attackAccept = [this.TOP];
}

Engine.objects.obstacles.Ladder.prototype = Object.create(Engine.objects.Solid.prototype);
Engine.objects.obstacles.Ladder.constructor = Engine.objects.obstacles.Ladder;

Engine.objects.obstacles.Ladder.prototype.collides = function(withObject, ourZone, theirZone)
{

}
