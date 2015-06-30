Engine.assets.obstacles.DeathZone = function()
{
    Engine.assets.Solid.call(this);
}

Engine.assets.obstacles.DeathZone.prototype = Object.create(Engine.assets.Solid.prototype);
Engine.assets.obstacles.DeathZone.constructor = Engine.assets.obstacles.DeathZone;

Engine.assets.obstacles.DeathZone.prototype.collides = function(withObject, ourZone, theirZone)
{
    if (withObject.health && !withObject.health.isDepleted()) {
        withObject.kill();
    }
}
