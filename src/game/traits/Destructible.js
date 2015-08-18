Game.traits.Destructible = function()
{
    Engine.Trait.call(this);
}

Engine.Util.extend(Game.traits.Destructible, Engine.Trait);

Game.traits.Destructible.prototype.NAME = 'destructible';

Game.traits.Destructible.prototype.__collides = function(withObject, ourZone, theirZone)
{
    if (withObject instanceof Game.objects.decorations.Explosion) {
        this._host.world.removeObject(this._host);
        return;
    }

    if (withObject instanceof Game.objects.Projectile) {
        if (withObject instanceof Game.objects.projectiles.CrashBomb) {
            return;
        }

        withObject.deflect();
    }
}
