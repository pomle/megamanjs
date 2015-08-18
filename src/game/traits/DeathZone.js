Game.traits.DeathZone = function()
{
    Engine.Trait.call(this);
}

Engine.Util.extend(Game.traits.DeathZone, Engine.Trait);

Game.traits.DeathZone.prototype.NAME = 'deathZone';

Game.traits.DeathZone.prototype.__collides = function(withObject, ourZone, theirZone)
{
    if (withObject.health && !withObject.health.depleted) {
        withObject.kill();
    }
}
