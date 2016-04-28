Game.traits.__Skeleton = function()
{
    Engine.Trait.call(this);
    this._privet = 'private value';
    this.public = 'public value';
}

Engine.Util.extend(Game.traits.__Skeleton, Engine.Trait);

Game.traits.__Skeleton.prototype.EVENT_NAME = 'event';

Game.traits.__Skeleton.prototype.__attach = function(host)
{
    Engine.Trait.prototype.__attach.call(this, host);
}

Game.traits.__Skeleton.prototype.__detach = function()
{
    Engine.Trait.prototype.__detach.call(this, host);
}

Game.traits.__Skeleton.prototype.__timeshift = function(deltaTime)
{
    this._host.setSomething = true;
    this._host.doSomething();
    if (this._host.setSomething === true) {
        this._trigger(this.EVENT_NAME);
    }
}

Game.traits.__Skeleton.prototype._private = function()
{
    console.log('Private method called');
}

Game.traits.__Skeleton.prototype.public = function()
{
    console.log('Public method called');
}

