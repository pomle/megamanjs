Game.objects.obstacles.DeathZone = function()
{
    Engine.Object.call(this);
}

Engine.Util.extend(Game.objects.obstacles.DeathZone, Engine.Object);

Game.objects.obstacles.DeathZone.prototype.collides = function(withObject, ourZone, theirZone)
{
    if (withObject.health && !withObject.health.depleted) {
        withObject.kill();
    }
}
