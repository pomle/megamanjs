Game.traits.Environment = function()
{
    Engine.Trait.call(this);
    this.atmosphericDensity = 1000;
    this.timeDilation = 1;
}

Engine.Util.extend(Game.traits.Environment, Engine.Trait);

Game.traits.Environment.prototype.NAME = 'deathZone';

Game.traits.Environment.prototype.__collides = function(subject)
{
	if (subject.physics) {
		p = subject.physics;
		p.atmosphericDensity = this.atmosphericDensity;
	}

	subject.timeStretch = this.timeDilation;
}
