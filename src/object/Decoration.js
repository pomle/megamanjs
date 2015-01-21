Engine.assets.Decoration = function()
{
    Engine.assets.Object.call(this);
}

Engine.assets.Decoration.prototype = Object.create(Engine.assets.Object.prototype);
Engine.assets.Decoration.constructor = Engine.assets.Decoration;

Engine.assets.Decoration.prototype.collides = function() {}

Engine.assets.decorations = {};
