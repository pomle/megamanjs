Game.traits.Oscillating = function()
{
    Engine.Trait.call(this);

    this.func = undefined;
    this.amplitude = new THREE.Vector2(10, 10);
    this.speed = 1;
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
    this._host.velocity.x = Math.sin(totalTime * this.speed * deltaTime) * this.amplitude;
}

Game.traits.Oscillating.prototype.circle = function(deltaTime, totalTime)
{
    var v = this._host.velocity,
        s = this.speed;
    v.x = Math.sin(totalTime * s) * this.amplitude.x * s;
    v.y = Math.cos(totalTime * s) * this.amplitude.y * s;
}
