Game.objects.Solid = function()
{
    Engine.Object.call(this);
    this.applyTrait(new Game.traits.Solid());
}

Engine.Util.extend(Game.objects.Solid, Engine.Object);

Game.objects.obstacles = {};
