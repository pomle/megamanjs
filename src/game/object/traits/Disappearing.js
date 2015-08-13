Game.traits.Disappearing = function()
{
    Engine.Trait.call(this);
    this._visible = true;
    this._collision = undefined;

    this.offDuration = 3;
    this.onDuration = 2;

    this.offset = 0;
}

Engine.Util.extend(Game.traits.Disappearing, Engine.Trait);

Game.traits.Disappearing.prototype.NAME = 'disappearing';

Game.traits.Disappearing.prototype.ANIM_APPEARING = 'appearing';

Game.traits.Disappearing.prototype.__timeshift = function(deltaTime, totalTime)
{
    var totalDuration = this.onDuration + this.offDuration;
    var modTime = (totalTime + this.offset) % totalDuration;
    if (this._visible === false && modTime > this.offDuration) {
        this.admit();
    }
    else if (this._visible === true && modTime < this.offDuration) {
        this.retract();
    }
}

Game.traits.Disappearing.prototype.admit = function()
{
    if (this._visible) {
        return;
    }

    var h = this._host;
    this._visible = true;
    h.model.visible = true;
    h.collidable = true;

    for (var i in h.animators) {
        h.animators[i].reset();
    }
}

Game.traits.Disappearing.prototype.retract = function()
{
    if (!this._visible) {
        return;
    }

    var h = this._host;
    this._visible = false;
    h.model.visible = false;
    h.collidable = false;
}
