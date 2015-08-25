Game.traits.Climber = function()
{
    Engine.Trait.call(this);

    this.attached = undefined;
    this.attachMargin = 5;
    this.speed = 60;
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

    /* Don't grab ladder unless going up or down. */
    var host = this._host;
    if (host.aim.y === 0) {
        return;
    }

    /* Don't grab ladder if going down and is on the ground. */
    if (host.aim.y < 0 && host.isSupported === true) {
        return;
    }

    if (host.aim.y > 0) {
        var ourBounds = new Engine.Collision.BoundingBox(host.model, ourZone);
        var theirBounds = new Engine.Collision.BoundingBox(subject.model, theirZone);
        if (ourBounds.bottom > theirBounds.top - this.attachMargin) {
            return;
        }
    }

    this.grab(subject);
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

    this.attached.climbable.constrain(host);
}

Game.traits.Climber.prototype.grab = function(object)
{
    this.release();
    this.attached = object;
    this.attached.climbable.attach(this._host);
}

Game.traits.Climber.prototype.release = function()
{
    if (this.attached === undefined) {
        return;
    }
    this.attached.climbable.detach(this._host);
    this.attached = undefined;
    this._host.physics.zero();
}