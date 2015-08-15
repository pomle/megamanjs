Engine.traits.Physics = function()
{
    Engine.Trait.call(this);

    this.gravity = true;

    this.area = 1.5;
    this.atmosphericDensity = 1.2;
    this.dragCoefficient = .47;
    this.mass = 1;

    this.acceleration = new THREE.Vector2();
    this.force = new THREE.Vector2();


    /*this.inertia = new THREE.Vector2();
    this.momentum = new THREE.Vector2();*/
}

Engine.Util.extend(Engine.traits.Physics, Engine.Trait);

Engine.traits.Physics.prototype.NAME = 'physics';

Engine.traits.Physics.prototype.__obstruct = function(object, attack)
{
    switch (attack) {
        case object.SURFACE_TOP:
        case object.SURFACE_BOTTOM:
            this.force.copy(object.velocity);
            break;
    }
}

Engine.traits.Physics.prototype.__timeshift = function physicsTimeshift(deltaTime)
{
    if (deltaTime !== 0) {
        var v = this._host.velocity;
        v.add(this.acceleration);
        /* It is very important that gravity is applied before the
           velocity is summed. Otherwise objects will not be pulled into the
           ground between ticks and collision detection in resting
           state will only happen every other tick. */
        if (this.gravity === true) {
            this._applyGravity(this.force, deltaTime);
        }
        this._applyDrag(this.force, deltaTime);

        v.x += (0.5 * this.acceleration.x * deltaTime * deltaTime);
        v.y += (0.5 * this.acceleration.y * deltaTime * deltaTime);
        this.force.divideScalar(this.mass);
        this.acceleration.add(this.force).divideScalar(2).multiplyScalar(deltaTime);
    }
    this.force.set(0, 0);
}

Engine.traits.Physics.prototype._applyDrag = function(acceleration, dt)
{
    var host = this._host;
    if (host.world === undefined) {
        return false;
    }
    var u = host.velocity.length();
    if (u === 0) {
        return true;
    }
    var dragForce = .5 * this.atmosphericDensity * this.dragCoefficient * this.area * u * u;
    var resistance = host.velocity.clone().normalize().multiplyScalar(dragForce);
    acceleration.sub(resistance);
    return true;
}

Engine.traits.Physics.prototype._applyGravity = function(acceleration, dt)
{
    if (this.mass === 0 || this._host.world === undefined) {
        return false;
    }
    var g = this._host.world.gravityForce;
    acceleration.x += this.mass * g.x * dt;
    acceleration.y -= this.mass * g.y * dt;
    return true;
}

Engine.traits.Physics.prototype.bump = function(x, y)
{
    this.inertia.x += x;
    this.inertia.y += y;
}

Engine.traits.Physics.prototype.zero = function()
{
    this.acceleration.multiplyScalar(0);
}
