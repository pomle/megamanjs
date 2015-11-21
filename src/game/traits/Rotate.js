Game.traits.Rotate = function()
{
    Engine.Trait.call(this);
    this.speed = 1;
}

Engine.Util.extend(Game.traits.Rotate, Engine.Trait);

Game.traits.Rotate.prototype.NAME = 'rotate';

Game.traits.Rotate.prototype.__timeshift = function(deltaTime, totalTime)
{
    this._host.model.rotation.z += (this.speed * deltaTime);
}
