Game.traits.Jump = function()
{
    Engine.Trait.call(this);

    this._elapsed = undefined;
    this._bump = new THREE.Vector2();
    this._ready = false;

    this.duration = .18;
    this.force = new THREE.Vector2(0, 100);
}

Engine.Util.extend(Game.traits.Jump, Engine.Trait);

Game.traits.Jump.prototype.NAME = 'jump';
Game.traits.Jump.prototype.EVENT_JUMP_ENGAGE = 'jump-engage';
Game.traits.Jump.prototype.EVENT_JUMP_CANCEL = 'jump-cancel';
Game.traits.Jump.prototype.EVENT_JUMP_END    = 'jump-end';

Game.traits.Jump.prototype.__obstruct = function(object, attack)
{
    if (attack === object.SURFACE_TOP) {
        this._ready = true;
    } else if (attack === object.SURFACE_BOTTOM) {
        this._end();
    }
}

Game.traits.Jump.prototype.__timeshift = function(deltaTime)
{
    this._ready = false;
    if (this._elapsed === undefined) {
        return;
    } else if (this._elapsed >= this.duration) {
        this._end();
    } else {
        this._elapsed += deltaTime;
    }
}

Game.traits.Jump.prototype.engage = function()
{
    var host = this._host;
    if (host.stunnedTime > 0) {
        return false;
    }

    if (host.climber !== undefined) {
        host.climber.release();
    }

    if (!this._ready) {
        return false;
    }

    this._bump.copy(this.force);
    this._bump.x *= host.direction.x;
    this._host.physics.velocity.add(this._bump);
    this._elapsed = 0;

    host.trigger(this.EVENT_JUMP_ENGAGE);

    return true;
}

Game.traits.Jump.prototype.cancel = function()
{
    if (this._elapsed !== undefined) {
        var progress = (this.duration - this._elapsed) / this.duration;
        this._host.physics.velocity.y -= this.force.y * progress * .8;
        this._host.trigger(this.EVENT_JUMP_CANCEL);
    }
    this._end();
}

Game.traits.Jump.prototype._end = function()
{
    this._elapsed = undefined;
    this._host.trigger(this.EVENT_JUMP_END);
}
