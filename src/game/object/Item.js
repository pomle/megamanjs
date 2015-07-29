Game.objects.Item = function()
{
    Engine.Object.call(this);
}

Game.objects.Item.prototype = Object.create(Engine.Object.prototype);
Game.objects.Item.constructor = Game.objects.Item;

Game.objects.items = {};
