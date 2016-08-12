Game.traits.Fallaway = function()
{
    Engine.Trait.call(this);

    this._countdown = undefined;
    this.originalPosition = undefined;
    this.delay = 1;
}

Engine.Util.extend(Game.traits.Fallaway, Engine.Trait);

Game.traits.Fallaway.prototype.NAME = 'fallaway';

Game.traits.Fallaway.prototype.__attach = function(host)
{
    Engine.Trait.prototype.__attach.call(this, host);
    this.reset();
}

Game.traits.Fallaway.prototype.__collides = function(withObject)
{
    if (this._countdown === undefined && withObject.isPlayer) {
        this._countdown = this.delay;
    }
}

Game.traits.Fallaway.prototype.__timeshift = function(deltaTime)
{
    if (this._countdown !== undefined) {
        if (this._countdown <= 0) {
            this.originalPosition = this._host.position.clone();
            this._host.physics.enable();
            this._countdown = undefined;
        }
        else {
            this._countdown -= deltaTime;
        }
    }
}

Game.traits.Fallaway.prototype.reset = function()
{
    this._host.physics.disable();
    this._host.physics.zero();
    if (this.originalPosition) {
        this._host.position.copy(this.originalPosition);
        this.originalPosition = undefined;
    }
}
