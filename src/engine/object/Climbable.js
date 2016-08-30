Engine.objects.Climbable = function()
{
    Engine.Object.call(this);
    this.applyTrait(new Engine.traits.Climbable());
}

Engine.Util.extend(Engine.objects.Climbable, Engine.Object);
