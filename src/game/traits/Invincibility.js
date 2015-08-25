Game.traits.Invincibility = function()
{
    Engine.Trait.call(this);

    this._engaged = false;
    this._elapsed = 0;
    this._health = undefined;

    this.duration = .5;

    this.engage = this.engage.bind(this);
    this.disengage = this.disengage.bind(this);
}

Engine.Util.extend(Game.traits.Invincibility, Engine.Trait);

Game.traits.Invincibility.prototype.NAME = 'invincibility';

Game.traits.Invincibility.prototype.__attach = function(host)
{
    this._health = this.__require(host, Game.traits.Health);
    Engine.Trait.prototype.__attach.call(this, host);
    host.bind(this._health.EVENT_HURT, this.engage);
}

Game.traits.Invincibility.prototype.__detach = function()
{
    this._host.unbind(this._health.EVENT_HURT, this.engage);
    this._health = undefined;
    Engine.Trait.prototype.__detach.call(this, host);
}

Game.traits.Invincibility.prototype.__timeshift = function(deltaTime)
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

Game.traits.Invincibility.prototype.disengage = function()
{
    this._health.immune = false;
    this._host.model.visible = true;
    this._engaged = false;
}

Game.traits.Invincibility.prototype.engage = function()
{
    if (this.duration !== 0) {
        this._health.immune = true;
        this._elapsed = 0;
        this._engaged = true;
    }
}
