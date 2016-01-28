Game.traits.Jump = function()
{
    Engine.Trait.call(this);

    this._elapsed = undefined;
    this._bump = new THREE.Vector2();

    this.duration = .18;
    this.force = new THREE.Vector2(0, 100);
    this.falloff =  1;
}

Engine.Util.extend(Game.traits.Jump, Engine.Trait);

Game.traits.Jump.prototype.NAME = 'jump';
Game.traits.Jump.prototype.EVENT_JUMP_ENGAGE = 'jump-engage';
Game.traits.Jump.prototype.EVENT_JUMP_CANCEL = 'jump-cancel';
Game.traits.Jump.prototype.EVENT_JUMP_END    = 'jump-end';

Game.traits.Jump.prototype.__obstruct = function(object, attack)
{
    switch (attack) {
        case object.SURFACE_TOP:
            this._host.isSupported = true;
            break;

        case object.SURFACE_BOTTOM:
            this._end();
            break;
    }
}

Game.traits.Jump.prototype.__timeshift = function(deltaTime)
{
    if (this._elapsed === undefined) {
        return;
    }

    if (this._elapsed >= this.duration) {
        this._end();
    }
    else {
        this._host.physics.force.add(this._bump);
        this._bump.multiplyScalar(this.falloff);
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

    if (!host.isSupported) {
        return false;
    }

    host.isSupported = false;
    this._bump.copy(this.force);
    this._bump.x *= host.direction.x;
    this._elapsed = 0;

    host.trigger(this.EVENT_JUMP_ENGAGE);
}

Game.traits.Jump.prototype.cancel = function()
{
    if (this._elapsed !== undefined) {
        var progress = (this.duration - this._elapsed) / this.duration;
        this._host.physics.force.y -= this.force.y * progress;

        this._host.trigger(this.EVENT_JUMP_CANCEL);
    }
    this._end();
}

Game.traits.Jump.prototype._end = function()
{
    this._elapsed = undefined;
    this._host.trigger(this.EVENT_JUMP_END);
}
