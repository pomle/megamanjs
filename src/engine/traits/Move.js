Engine.traits.Move = function()
{
    Engine.Trait.call(this);

    this._moveSpeed = 0;
    this._physics = undefined;
    this._walk = 0;

    this.acceleration = 500;
    this.speed = 90;
}

Engine.Util.extend(Engine.traits.Move, Engine.Trait);

Engine.traits.Move.prototype.__attach = function(object)
{
    for (var i = 0, l = object.traits.length; i < l; ++i) {
        if (object.traits[i] instanceof Engine.traits.Physics) {
            this._physics = object.traits[i];
            break;
        }
    }
    if (this._physics === undefined) {
        throw new Error("Move trait depends on Physics trait which could not be found on object");
    }
    Engine.Trait.prototype.__attach.call(this, object);
}

Engine.traits.Move.prototype.__detach = function()
{
    this._physics = undefined;
    Engine.Trait.prototype.__detach.call(this, object);
}

Engine.traits.Move.prototype.__timeshift = function(deltaTime)
{
    if (this.object.stunnedTime > 0) {
        return;
    }
    this._physics.momentum.set(0, 0);
    if (this._walk) {
        this.object.setDirection(this._walk > 0 ? this.object.RIGHT : this.object.LEFT);
    }
    this.calculateSpeed(deltaTime);
    this._physics.momentum.x = this._moveSpeed * this._walk;
}

Engine.traits.Move.prototype.calculateSpeed = function(dt)
{
    if (this._walk === 0) {
        this._moveSpeed = 0;
        return;
    }

    this._moveSpeed = Math.min(this._moveSpeed + this.acceleration * dt, this.speed);
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
