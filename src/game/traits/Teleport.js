Game.traits.Teleport = function()
{
    Engine.Trait.call(this);
    this._destination = undefined;
    this._endProgress = 0;
    this._startProgress = 0;
    this.endDuration = .15;
    this.startDuration = .15;
    this.speed = 900;
    this.state = this.STATE_OFF;
}

Game.traits.Teleport.prototype = Object.create(Engine.Trait.prototype);
Game.traits.Teleport.constructor = Engine.Trait;

Game.traits.Teleport.prototype.NAME = 'teleport';

Game.traits.Teleport.prototype.EVENT_DEST_REACHED = 'teleport-dest-reached';
Game.traits.Teleport.prototype.EVENT_END = 'teleport-end';
Game.traits.Teleport.prototype.EVENT_START = 'teleport-start';

Game.traits.Teleport.prototype.STATE_OFF = 0;
Game.traits.Teleport.prototype.STATE_IN = 1;
Game.traits.Teleport.prototype.STATE_GO = 2;
Game.traits.Teleport.prototype.STATE_OUT = 3;

Game.traits.Teleport.prototype.__timeshift = function(dt)
{
    if (this._destination) {
        this._handle(dt);
    }
}

Game.traits.Teleport.prototype._start = function()
{
    this.state = this.STATE_IN;
    this._startProgress = this.startDuration;
    this._host.collidable = false;
    this._host.physics.enabled = false;
    this._host.trigger(this.EVENT_START);
}

Game.traits.Teleport.prototype._end = function()
{
    this.state = this.STATE_OUT;
    this._endProgress = this.endDuration;
    this._host.collidable = true;
    this._host.physics.enabled = true;
    this._host.trigger(this.EVENT_END);
}

Game.traits.Teleport.prototype._stop = function()
{
    this.state = this.STATE_OFF;
    this._destination = undefined;
}

Game.traits.Teleport.prototype._handle = function(dt)
{
    /* Block velocity. */
    this._host.velocity.set(0, 0);

    if (this._startProgress > 0) {
        this._startProgress -= dt;
    }
    else if (this._endProgress > 0) {
        this._endProgress -= dt;
        if (this._endProgress <= 0) {
            this._stop();
        }
    }
    else {
        this.state = this.STATE_GO;
        var teleportDistance = Engine.Animation.vectorTraverse(
            this._host.position, this._destination, this.speed * dt);
        if (teleportDistance === 0) {
            this._host.trigger(this.EVENT_DEST_REACHED);
            this._end();
        }
    }
}

Game.traits.Teleport.prototype.nudge = function(vec2)
{
    var dest = this._host.position.clone();
    dest.x += vec2.x;
    dest.y += vec2.y;
    this.to(dest);
}

Game.traits.Teleport.prototype.to = function(vec2)
{
    this._destination = vec2;
    this._start();
}
