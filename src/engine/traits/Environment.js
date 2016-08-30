Engine.traits.Environment = function()
{
    Engine.Trait.call(this);
    this.atmosphericDensity = 1000;
    this.timeDilation = 1;
}

Engine.Util.extend(Engine.traits.Environment, Engine.Trait);

Engine.traits.Environment.prototype.NAME = 'deathZone';

Engine.traits.Environment.prototype.__collides = function(subject)
{
	if (subject.physics) {
		p = subject.physics;
		p.atmosphericDensity = this.atmosphericDensity;
	}

	subject.timeStretch = this.timeDilation;
}
