Engine.traits.Invincibility = function()
{
    Engine.Trait.call(this);

    this._engaged = false;
    this._elapsed = 0;
    this._health = undefined;

    this.duration = 2;

    this.engage = this.engage.bind(this);
    this.disengage = this.disengage.bind(this);
}

Engine.Util.extend(Engine.traits.Invincibility, Engine.Trait);

Engine.traits.Invincibility.prototype.__attach = function(object)
{
    for (var i = 0, l = object.traits.length; i < l; ++i) {
        if (object.traits[i] instanceof Engine.traits.Health) {
            this._health = object.traits[i];
            break;
        }
    }
    if (this._health === undefined) {
        throw new Error("Invincibility trait depends on Health trait which could not be found on object");
    }
    Engine.Trait.prototype.__attach.call(this, object);
    this.object.bind(Engine.traits.Health.prototype.EVENT_DAMAGED, this.engage);
}

Engine.traits.Invincibility.prototype.__detach = function()
{
    this._health = undefined;
    this.object.unbind(Engine.traits.Health.prototype.EVENT_DAMAGED, this.engage);
    Engine.Trait.prototype.__detach.call(this, object);
}

Engine.traits.Invincibility.prototype.__timeshift = function(deltaTime)
{
    if (this._engaged) {
        this._elapsed += deltaTime;
        this.object.model.visible = !this.object.model.visible;
        if (this._elapsed >= this.duration) {
            this.disengage();
        }
    }
}

Engine.traits.Invincibility.prototype.disengage = function()
{
    this._health.infinite = false;
    this.object.model.visible = true;
    this._engaged = false;
}

Engine.traits.Invincibility.prototype.engage = function()
{
    this._health.infinite = true;
    this._elapsed = 0;
    this._engaged = true;
}
