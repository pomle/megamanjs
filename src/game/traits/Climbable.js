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

Game.traits.Climbable.prototype.detach = function(subject)
{
    this.ignore.delete(subject);
}
