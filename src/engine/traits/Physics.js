Engine.traits.Physics = function()
{
    Engine.Trait.call(this);

    this.gravity = true;
    this.mass = 1;
    this.inertia = new THREE.Vector2();
    this.momentum = new THREE.Vector2();
}

Engine.Util.extend(Engine.traits.Physics, Engine.Trait);

Engine.traits.Physics.prototype.NAME = 'physics';

Engine.traits.Physics.prototype.__obstruct = function(object, attack)
{
    switch (attack) {
        case object.SURFACE_TOP:
        case object.SURFACE_BOTTOM:
            this.inertia.copy(object.velocity);
            break;
    }
}

Engine.traits.Physics.prototype.__timeshift = function physicsTimeshift(dt)
{
    if (dt !== 0) {
        /* It is very important that gravity is applied before the
           velocity is summed. Otherwise objects will not be pulled into the
           ground between ticks and collision detection in resting
           state will only happen every other tick. */
        if (this.gravity === true) {
            this._applyGravity(dt);
        }
        this._host.velocity.set(0, 0);
        this._host.velocity.add(this.inertia);
        this._host.velocity.add(this.momentum);
    }
}

Engine.traits.Physics.prototype._applyGravity = function(dt)
{
    if (this.mass === 0 || this._host.world === undefined) {
        return false;
    }
    var g = this._host.world.gravityForce;
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
