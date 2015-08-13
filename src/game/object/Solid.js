Game.objects.Solid = function()
{
    Engine.Object.call(this);
    this.solid = this.applyTrait(new Engine.traits.Solid());
}

Engine.Util.extend(Game.objects.Solid, Engine.Object);

Game.objects.obstacles = {};
