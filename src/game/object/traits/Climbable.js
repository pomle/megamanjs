Game.traits.Climbable = function()
{
    this.__solid = Engine.traits.Solid;
    this.__solid.call(this);
    this.attackAccept = [this.TOP];
    this.attached = new Set();
}

Engine.Util.extend(Game.traits.Climbable, Engine.traits.Solid);

Game.traits.Climbable.prototype.__collides = function(subject, ourZone, theirZone)
{
    if (!this.attached.has(subject)
    && subject.move !== undefined
    && subject.move._climb
    && subject.direction.y < 0) {
        this._attach(subject);
    }
    else {
        this.__solid.prototype.__collides.call(this, subject, ourZone, theirZone);
    }
}

Game.traits.Climbable.prototype.__uncollides = function(subject)
{
    this._detach(subject);
}

Game.traits.Climbable.prototype.__timeshift = function(dt)
{
    var v = this._host.velocity;
    for (var subject of this.attached) {
        if (subject.isClimbing === false) {
            this._detach(subject);
        }
        else {
            subject.isSupported = true;
            this._constrainSubject(subject);
        }
    }
}

Game.traits.Climbable.prototype._attach = function(subject)
{
    this.attached.add(subject);
    subject.isClimbing = true;
    subject.physics.gravity = false;
    subject.physics.zero();
    this._constrainSubject(subject, true);
    this.ignore.add(subject);
}

/**
 * Restricts the subjects X position to
 * if frames has changed between previous and previous + deltaTime.
 *
 * @param {Number} [deltaTime]
 */
Game.traits.Climbable.prototype._constrainSubject = function(subject, constrainVertical)
{
    var collision = this._host.collision;
    var model = this._host.model;
    var constrainVertical = (constrainVertical === true);
    for (var i = 0, l = collision.length; i < l; ++i) {
        var bounds = new Engine.Collision.BoundingBox(model, collision[i]);
        if (subject.position.x > bounds.r) {
            subject.position.x = bounds.r;
        }
        else if (subject.position.x < bounds.l) {
            subject.position.x = bounds.l;
        }
        if (constrainVertical) {
            if (subject.position.y > bounds.t) {
                subject.position.y = bounds.t;
            }
            else if (subject.position.y < bounds.b) {
                subject.position.y = bounds.b;
            }
        }
    }
}

Game.traits.Climbable.prototype._detach = function(subject)
{
    if (this.attached.has(subject)) {
        this.attached.delete(subject);
        this.ignore.delete(subject);
        subject.isClimbing = false;
        subject.physics.gravity = true;
    }
}
