Engine.traits.Physics = function()
{
    Engine.Trait.call(this);

    this.enabled = true;
    this.mass = 0;
    this.inertia = new THREE.Vector2();
    this.momentum = new THREE.Vector2();
}

Engine.traits.Physics.prototype = Object.create(Engine.Trait.prototype);
Engine.traits.Physics.constructor = Engine.Trait;

Engine.traits.Physics.prototype.NAME = 'physics';

Engine.traits.Physics.prototype.__timeshift = function(dt)
{
    if (this.enabled && dt) {
        /* It is very important that gravity is applied before the
           velocity is summed. Otherwise objects will not be pulled into the
           ground between ticks and collision detection in resting
           state will only happen every other tick. */
        this._applyGravity(dt);
        this.object.velocity.set(0, 0);
        this.object.velocity.add(this.inertia);
        this.object.velocity.add(this.momentum);
    }
}

Engine.traits.Physics.prototype._applyGravity = function(dt)
{
    if (this.mass == 0) {
        return false;
    }
    var g = this.object.scene.gravityForce;
    if (g && (g.x || g.y)) {
        this.inertia.x += g.x * dt;
        this.inertia.y -= g.y * dt;
    }
    return true;
}

Engine.traits.Physics.prototype.bump = function(x, y)
{
    this.inertia.x += x;
    this.inertia.y += y;
}

Engine.traits.Physics.prototype.zero = function()
{
    this.momentum.multiplyScalar(0);
    this.inertia.multiplyScalar(0);
}
