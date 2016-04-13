Game.traits.Climber = function()
{
    Engine.Trait.call(this);

    this.attached = undefined;
    this.bounds = {
        climbable: undefined,
        host: undefined,
    };

    this.speed = 60;

    this.thresholds = {
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
    };
}

Engine.Util.extend(Game.traits.Climber, Engine.Trait);

Game.traits.Climber.prototype.NAME = 'climber';

Game.traits.Climber.prototype.__collides = function(subject, ourZone, theirZone)
{
    /* Don't regrab anything in the middle of climbing. */
    if (this.attached !== undefined) {
        return;
    }

    /* Don't grab anything without climbable trait. */
    if (subject.climbable === undefined) {
        return;
    }

    this.grab(subject, ourZone, theirZone);
}

Game.traits.Climber.prototype.__obstruct = function(object, attack)
{
    /* If we touch ground, release climbable. */
    if (object.SURFACE_TOP === attack) {
        this.release();
    }
}

Game.traits.Climber.prototype.__timeshift = function(deltaTime)
{
    if (this.attached === undefined) {
        return;
    }

    var host = this._host;
    this._host.physics.zero();

    host.velocity.copy(this.attached.velocity);
    host.velocity.add(host.aim.clone().setLength(this.speed));

    if (host.aim.y > 0 && host.position.y > this.bounds.climbable.top - this.thresholds.top) {
        this.bounds.host.bottom = this.bounds.climbable.top;
        host.obstruct(this.attached, this.attached.SURFACE_TOP);
        this.release();
        return;
    }

    this.constrain();
}

Game.traits.Climber.prototype.constrain = function()
{
    var subject = this._host,
        climbable = this.bounds.climbable,
        thresh = this.thresholds;

    if (subject.position.x > climbable.right + thresh.right) {
        subject.position.x = climbable.right + thresh.right;
    }
    else if (subject.position.x < climbable.left - thresh.left) {
        subject.position.x = climbable.left - thresh.left;
    }

    if (subject.position.y > climbable.top - thresh.top) {
        subject.position.y = climbable.top - thresh.top;
    }
    else if (subject.position.y < climbable.bottom + thresh.bottom) {
        subject.position.y = climbable.bottom + thresh.bottom;
    }
}

Game.traits.Climber.prototype.grab = function(subject, ourZone, theirZone)
{
    this.release();

    /* Don't grab ladder unless going up or down. */
    var host = this._host;
    if (host.aim.y === 0) {
        return false;
    }

    /* Don't grab ladder if going down and is on the ground. */
    if (host.aim.y < 0 && host.jump && host.jump._ready === true) {
        return false;
    }

    var bounds = {
        climbable: new Engine.Collision.BoundingBox(subject, theirZone),
        host: new Engine.Collision.BoundingBox(host, ourZone),
    };

    /* Don't grab ladder if on top and push up. */
    if (host.aim.y > 0) {
        if (host.position.y > bounds.climbable.top - this.thresholds.top) {
            return false;
        }
    }

    this.bounds.climbable = bounds.climbable;
    this.bounds.host = bounds.host;

    this.attached = subject;
    this.attached.climbable.attach(host);

    this.constrain();

    return true;
}

Game.traits.Climber.prototype.release = function()
{
    if (this.attached === undefined) {
        return;
    }
    this.bounds.climbable = undefined;
    this.bounds.host = undefined;
    this.attached.climbable.detach(this._host);
    this.attached = undefined;
    this._host.physics.zero();
}
