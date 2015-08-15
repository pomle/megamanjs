Game.traits.Oscillating = function()
{
    Engine.Trait.call(this);

    this.func = undefined;
    this.magnitude = 10;
    this.speed = 10;
}

Engine.Util.extend(Game.traits.Oscillating, Engine.Trait);

Game.traits.Oscillating.prototype.NAME = 'oscillating';

Game.traits.Oscillating.prototype.__timeshift = function(deltaTime, totalTime)
{
	switch (this.func) {
		case 'pendelum':
			return this.pendelum.apply(this, arguments);
		case 'circle':
			return this.circle.apply(this, arguments);
	}
}

Game.traits.Oscillating.prototype.pendelum = function(deltaTime, totalTime)
{
    this._host.velocity.x = Math.sin(totalTime * this.speed * deltaTime) * this.magnitude;
}

Game.traits.Oscillating.prototype.circle = function(deltaTime, totalTime)
{
    this._host.velocity.x = Math.sin(totalTime * this.speed * deltaTime) * this.magnitude;
    this._host.velocity.y = Math.cos(totalTime * this.speed * deltaTime) * this.magnitude;
}
