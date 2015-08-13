Engine.traits.Stun = function()
{
    Engine.Trait.call(this);

    this._health = undefined;
    this._move = undefined;

    this._elapsed = 0;
    this._engaged = false;
    this.duration = .5;

    this.engage = this.engage.bind(this);
    this.disengage = this.disengage.bind(this);
}

Engine.Util.extend(Engine.traits.Stun, Engine.Trait);

Engine.traits.Stun.prototype.NAME = 'stun';

Engine.traits.Stun.prototype.EVENT_STUN_ENGAGE = 'stun-engaged';
Engine.traits.Stun.prototype.EVENT_STUN_DISENGAGE = 'stun-disengage';

Engine.traits.Stun.prototype.__attach = function(host)
{
    this._health = this.__require(host, Engine.traits.Health);
    this._move = this.__require(host, Engine.traits.Move);
    Engine.Trait.prototype.__attach.call(this, host);
    this._host.bind(this._health.EVENT_DAMAGED, this.engage);
}

Engine.traits.Stun.prototype.__detach = function()
{
    this._host.unbind(this._health.EVENT_DAMAGED, this.engage);
    this._health = undefined;
    this._move = undefined;
    Engine.Trait.prototype.__detach.call(this, host);
}

Engine.traits.Stun.prototype.__timeshift = function(deltaTime)
{
    if (this._engaged) {
        if (this._elapsed >= this.duration) {
            this.disengage();
        }
        else {
            this._elapsed += deltaTime;
        }
    }
}

Engine.traits.Stun.prototype.disengage = function()
{
    this._engaged = false;
    this._move.inhibit = false;
}

Engine.traits.Stun.prototype.engage = function()
{
    if (this.duration !== 0) {
        this._move.inhibit = true;
        this._engaged = true;
        this._elapsed = 0;
    }
}
