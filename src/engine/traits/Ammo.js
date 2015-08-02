Engine.traits.Ammo = function()
{
    Engine.Trait.apply(this, arguments);
    Engine.traits._Energy.apply(this, arguments);
}

Engine.Util.extend(Engine.traits.Ammo, Engine.Trait);
Engine.Util.mixin(Engine.traits.Ammo, Engine.traits._Energy);
