Engine.traits.Rotate = function()
{
    Engine.Trait.call(this);
    this.speed = 1;
}

Engine.Util.extend(Engine.traits.Rotate, Engine.Trait);

Engine.traits.Rotate.prototype.NAME = 'rotate';

Engine.traits.Rotate.prototype.__timeshift = function(deltaTime, totalTime)
{
    this._host.model.rotation.z += (this.speed * deltaTime);
}
