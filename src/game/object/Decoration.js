Game.objects.Decoration = function()
{
    Engine.Object.call(this);
}

Game.objects.Decoration.prototype = Object.create(Engine.Object.prototype);
Game.objects.Decoration.constructor = Game.objects.Decoration;

Game.objects.Decoration.prototype.collides = function() {}

Game.objects.decorations = {};
