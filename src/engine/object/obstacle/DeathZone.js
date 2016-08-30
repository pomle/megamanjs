Game.objects.obstacles.DeathZone = function()
{
    Engine.Object.call(this);
    this.applyTrait(new Game.traits.DeathZone);
}

Engine.Util.extend(Game.objects.obstacles.DeathZone, Engine.Object);
