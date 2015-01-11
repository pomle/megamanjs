Engine.assets.objects.Item = function()
{
    Engine.assets.Object.call(this);
}

Engine.assets.objects.Item.prototype = Object.create(Engine.assets.Object.prototype);
Engine.assets.objects.Item.constructor = Engine.assets.objects.Item;

Engine.assets.objects.items = {};
