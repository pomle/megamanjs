Engine.traits.__Skeleton = function()
{
    Engine.Trait.call(this);
    this._privet = 'private value';
    this.public = 'public value';
}

Engine.Util.extend(Engine.traits.__Skeleton, Engine.Trait);

Engine.traits.Health.prototype.EVENT_NAME = 'event';

Engine.traits.__Skeleton.prototype.__attach = function(host)
{
    Engine.Trait.prototype.__attach.call(this, host);
}

Engine.traits.__Skeleton.prototype.__detach = function()
{
    Engine.Trait.prototype.__detach.call(this, host);
}

Engine.traits.__Skeleton.prototype.__timeshift = function(deltaTime)
{
    this.__host.setSomething = true;
    this.__host.doSomething();
    if (this.__host.setSomething === true) {
        this.__host.trigger(this.EVENT_NAME);
    }
}

Engine.traits.__Skeleton.prototype._private = function()
{
    console.log('Private method called');
}

Engine.traits.__Skeleton.prototype.public = function()
{
    console.log('Public method called');
}

