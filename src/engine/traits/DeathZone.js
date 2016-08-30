Game.traits.DeathZone = function()
{
    Engine.Trait.call(this);
}

Engine.Util.extend(Game.traits.DeathZone, Engine.Trait);

Game.traits.DeathZone.prototype.NAME = 'deathZone';

Game.traits.DeathZone.prototype.__collides = function(withObject, ourZone, theirZone)
{
    if (withObject.health !== undefined && withObject.health.energy.depleted === false) {
        withObject.health.kill();
    }
}
