Game.objects.Solid = function()
{
    Engine.Object.call(this);
    this.solid = this.applyTrait(new Engine.traits.Solid());
}

Game.objects.Solid.prototype = Object.create(Engine.Object.prototype);
Game.objects.Solid.constructor = Game.objects.Solid;

Game.objects.obstacles = {};
