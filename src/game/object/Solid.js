Game.objects.Solid = function()
{
    Engine.Object.call(this);
    var solid = new Game.traits.Solid();
    solid.fixed = true;
    this.applyTrait(solid);
}

Engine.Util.extend(Game.objects.Solid, Engine.Object);

Game.objects.obstacles = {};
