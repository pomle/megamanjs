Engine.objects.Solid = function()
{
    Engine.Object.call(this);
    var solid = new Engine.traits.Solid();
    solid.fixed = true;
    solid.obstructs = true;
    this.applyTrait(solid);
}

Engine.Util.extend(Engine.objects.Solid, Engine.Object);

Engine.objects.obstacles = {};
