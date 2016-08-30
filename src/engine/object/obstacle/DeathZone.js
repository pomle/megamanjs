Engine.objects.obstacles.DeathZone = function()
{
    Engine.Object.call(this);
    this.applyTrait(new Engine.traits.DeathZone);
}

Engine.Util.extend(Engine.objects.obstacles.DeathZone, Engine.Object);
