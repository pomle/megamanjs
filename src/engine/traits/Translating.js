Engine.traits.Translating = function()
{
    Engine.Trait.call(this);

    this.func = undefined;
    this.amplitude = new THREE.Vector2(1, 1);
    this.speed = 1;
}

Engine.Util.extend(Engine.traits.Translating, Engine.Trait);

Engine.traits.Translating.prototype.NAME = 'translating';

Engine.traits.Translating.prototype.__timeshift = function(deltaTime, totalTime)
{
    switch (this.func) {
        case 'linear':
            return this.linear.apply(this, arguments);
        case 'oscillate':
            return this.oscillate.apply(this, arguments);
    }
}

Engine.traits.Translating.prototype.linear = function(deltaTime, totalTime)
{
    var v = this._host.velocity;
    v.x = this.amplitude.x * this.speed;
    v.y = this.amplitude.y * this.speed;
}

Engine.traits.Translating.prototype.oscillate = function(deltaTime, totalTime)
{
    var v = this._host.velocity,
        s = this.speed,
        t = totalTime + deltaTime / 2;
    v.x = Math.sin(t * s) * this.amplitude.x * s;
    v.y = Math.cos(t * s) * this.amplitude.y * s;
}
