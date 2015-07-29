Game.objects.obstacles.Ladder = function()
{
    Game.objects.Solid.call(this);
    this.attackAccept = [this.TOP];
}

Game.objects.obstacles.Ladder.prototype = Object.create(Game.objects.Solid.prototype);
Game.objects.obstacles.Ladder.constructor = Game.objects.obstacles.Ladder;

Game.objects.obstacles.Ladder.prototype.collides = function(withObject, ourZone, theirZone)
{

}
