Engine.traits.Move = function()
{
    Engine.Trait.call(this);

    this._climbSpeed = 0;
    this._moveSpeed = 0;
    this._physics = undefined;

    this._climb = 0;
    this._walk = 0;

    this.acceleration = 500;
    this.climbSpeed = 50;
    this.speed = 90;
}

Engine.Util.extend(Engine.traits.Move, Engine.Trait);

Engine.traits.Move.prototype.NAME = 'move';

Engine.traits.Move.prototype.__attach = function(host)
{
    for (var i = 0, l = host.traits.length; i < l; ++i) {
        if (host.traits[i] instanceof Engine.traits.Physics) {
            this._physics = host.traits[i];
            break;
        }
    }
    if (this._physics === undefined) {
        throw new Error("Move trait depends on Physics trait which could not be found on host");
    }
    Engine.Trait.prototype.__attach.call(this, host);
}

Engine.traits.Move.prototype.__detach = function()
{
    this._physics = undefined;
    Engine.Trait.prototype.__detach.call(this, host);
}

Engine.traits.Move.prototype.__obstruct = function(object, attack)
{
    switch (attack) {
        case object.solid.LEFT:
        case object.solid.RIGHT:
            this._moveSpeed = Math.abs(object.velocity.x);
            break;
    }
}

Engine.traits.Move.prototype.__timeshift = function(deltaTime)
{
    this._physics.momentum.set(0, 0);
    this._handleWalk(deltaTime);
    this._handleClimb(deltaTime);
}

Engine.traits.Move.prototype._handleClimb = function(dt)
{
    /* When moving left and right, we still maintain the direction the
       host points to. This is not true for up and down therefore we
       reset the vertical direction to zero unless up or down motion
       is taking place. */
    var host = this._host;
    if (this._climb !== 0) {
        host.direction.y = this._climb > 0 ? host.DIRECTION_UP : host.DIRECTION_DOWN;
    }
    else {
        host.direction.y = 0;
    }

    if (host.isClimbing) {
        this._physics.momentum.y = this.climbSpeed * host.direction.y;
    }
}

Engine.traits.Move.prototype._handleWalk = function(dt)
{
    var host = this._host;
    if (this._walk) {
        var dir = this._walk > 0 ? host.DIRECTION_RIGHT : host.DIRECTION_LEFT;
        host.model.scale.x = dir;
        host.direction.x = dir;
        this._moveSpeed = Math.min(this._moveSpeed + this.acceleration * dt, this.speed);
    }
    else {
        this._moveSpeed = 0;
    }
    this._physics.momentum.x = this._moveSpeed * host.direction.x;
}

Engine.traits.Move.prototype.leftStart = function()
{
    this._walk--;
}

Engine.traits.Move.prototype.leftEnd = function()
{
    this._walk++;
}

Engine.traits.Move.prototype.rightStart = function()
{
    this._walk++;
}

Engine.traits.Move.prototype.rightEnd = function()
{
    this._walk--;
}

Engine.traits.Move.prototype.upStart = function()
{
    ++this._climb;
}

Engine.traits.Move.prototype.upEnd = function()
{
    --this._climb;
}

Engine.traits.Move.prototype.downStart = function()
{
    --this._climb;
}

Engine.traits.Move.prototype.downEnd = function()
{
    ++this._climb;
}
