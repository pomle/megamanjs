Engine.traits.DeathZone = function()
{
    Engine.Trait.call(this);
}

Engine.Util.extend(Engine.traits.DeathZone, Engine.Trait);

Engine.traits.DeathZone.prototype.NAME = 'deathZone';

Engine.traits.DeathZone.prototype.__collides = function(withObject, ourZone, theirZone)
{
    if (withObject.health !== undefined && withObject.health.energy.depleted === false) {
        withObject.health.kill();
    }
}
