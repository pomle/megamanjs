Game.traits.Climbable = function()
{
    Game.traits.Solid.call(this);
    this.attackAccept = [this.TOP];
}

Engine.Util.extend(Game.traits.Climbable, Game.traits.Solid);
Game.traits.Climbable.prototype.NAME = 'climbable';


Game.traits.Climbable.prototype.__uncollides = function(subject)
{
    if (subject.climber && subject.climber.attached === this._host) {
        subject.climber.release();
    }
    Game.traits.Solid.prototype.__uncollides.call(this, subject);
}

Game.traits.Climbable.prototype.attach = function(subject)
{
    this.ignore.add(subject);
}

/**
 * Restricts the subjects X position to
 * if frames has changed between previous and previous + deltaTime.
 *
 * @param {Number} [deltaTime]
 */
Game.traits.Climbable.prototype.constrain = function(subject, constrainVertical)
{
    var host = this._host;
    var collision = host.collision;
    var model = host.model;
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

Game.traits.Climbable.prototype.detach = function(subject)
{
    this.ignore.delete(subject);
}
