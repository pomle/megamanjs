Engine.assets.Decoration = function()
{
    Engine.Object.call(this);
}

Engine.assets.Decoration.prototype = Object.create(Engine.Object.prototype);
Engine.assets.Decoration.constructor = Engine.assets.Decoration;

Engine.assets.Decoration.prototype.collides = function() {}

Engine.assets.decorations = {};
