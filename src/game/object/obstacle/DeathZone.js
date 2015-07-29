Game.objects.obstacles.DeathZone = function()
{
    Game.objects.Solid.call(this);
}

Game.objects.obstacles.DeathZone.prototype = Object.create(Game.objects.Solid.prototype);
Game.objects.obstacles.DeathZone.constructor = Game.objects.obstacles.DeathZone;

Game.objects.obstacles.DeathZone.prototype.collides = function(withObject, ourZone, theirZone)
{
    if (withObject.health && !withObject.health.isDepleted()) {
        withObject.kill();
    }
}
