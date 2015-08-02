Engine.traits.Invincibility = function()
{
    Engine.Trait.call(this);

    this._engaged = false;
    this._elapsed = 0;
    this._health = undefined;

    this.duration = .5;

    this.engage = this.engage.bind(this);
    this.disengage = this.disengage.bind(this);
}

Engine.Util.extend(Engine.traits.Invincibility, Engine.Trait);

Engine.traits.Invincibility.prototype.__attach = function(host)
{
    for (var i = 0, l = host.traits.length; i < l; ++i) {
        if (host.traits[i] instanceof Engine.traits.Health) {
            this._health = host.traits[i];
            break;
        }
    }
    if (this._health === undefined) {
        throw new Error("Invincibility trait depends on Health trait which could not be found on host");
    }
    Engine.Trait.prototype.__attach.call(this, host);
    this._host.bind(Engine.traits.Health.prototype.EVENT_DAMAGED, this.engage);
}

Engine.traits.Invincibility.prototype.__detach = function()
{
    this._health = undefined;
    this._host.unbind(Engine.traits.Health.prototype.EVENT_DAMAGED, this.engage);
    Engine.Trait.prototype.__detach.call(this, host);
}

Engine.traits.Invincibility.prototype.__timeshift = function(deltaTime)
{
    if (this._engaged) {
        this._host.model.visible = !this._host.model.visible;
        if (this._elapsed >= this.duration) {
            this.disengage();
        }
        else {
            this._elapsed += deltaTime;
        }
    }
}

Engine.traits.Invincibility.prototype.disengage = function()
{
    this._health.infinite = false;
    this._host.model.visible = true;
    this._engaged = false;
}

Engine.traits.Invincibility.prototype.engage = function()
{
    if (this.duration !== 0) {
        this._health.infinite = true;
        this._elapsed = 0;
        this._engaged = true;
    }
}
