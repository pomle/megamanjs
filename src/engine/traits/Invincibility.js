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

Engine.traits.Invincibility.prototype.NAME = 'invincibility';

Engine.traits.Invincibility.prototype.__attach = function(host)
{
    this._health = this.__require(host, Engine.traits.Health);
    Engine.Trait.prototype.__attach.call(this, host);
    this._host.bind(this._health.EVENT_DAMAGED, this.engage);
}

Engine.traits.Invincibility.prototype.__detach = function()
{
    this._host.unbind(this._health.EVENT_DAMAGED, this.engage);
    this._health = undefined;
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
