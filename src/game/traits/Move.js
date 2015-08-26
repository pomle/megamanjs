Game.traits.Move = function()
{
    Engine.Trait.call(this);

    this._walkSpeed = 0;
    this._physics = undefined;

    this._walk = 0;

    this.acceleration = 500;
    this.speed = 90;
}

Engine.Util.extend(Game.traits.Move, Engine.Trait);

Game.traits.Move.prototype.NAME = 'move';

Game.traits.Move.prototype.__attach = function(host)
{
    this._physics = this.__require(host, Game.traits.Physics);
    Engine.Trait.prototype.__attach.call(this, host);
}

Game.traits.Move.prototype.__detach = function()
{
    this._physics = undefined;
    Engine.Trait.prototype.__detach.call(this, host);
}

Game.traits.Move.prototype.__obstruct = function(object, attack)
{
    switch (attack) {
        case object.SURFACE_LEFT:
        case object.SURFACE_RIGHT:
            this._walkSpeed = Math.abs(object.velocity.x);
            break;
    }
}

Game.traits.Move.prototype.__timeshift = function(deltaTime)
{
    this._handleWalk(deltaTime);
}

Game.traits.Move.prototype._handleWalk = function(dt)
{
    var host = this._host;
    if (this._walk) {
        host.direction.x = this._walk > 0 ? host.DIRECTION_RIGHT : host.DIRECTION_LEFT;
        this._walkSpeed = Math.min(this._walkSpeed + this.acceleration * dt, this.speed);
        host.velocity.x += this._walkSpeed * host.direction.x;
    }
    else {
        this._walkSpeed = 0;
    }
}

Game.traits.Move.prototype.leftStart = function()
{
    --this._walk;
}

Game.traits.Move.prototype.leftEnd = function()
{
    ++this._walk;
}

Game.traits.Move.prototype.rightStart = function()
{
    ++this._walk;
}

Game.traits.Move.prototype.rightEnd = function()
{
    --this._walk;
}
