Engine.traits.Physics = function()
{
    Engine.Trait.call(this);

    this.gravity = true;

    this.area = 0.1;
    this.atmosphericDensity = 1000;
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
            this._host.velocity.copy(object.velocity);
            break;
    }
}

var ay = 0;

Engine.traits.Physics.prototype.__timeshift = function physicsTimeshift(dt)
{
    if (dt !== 0) {
        var v = this._host.velocity;
        var p = this._host.position;
        var m = this.mass;

        var fy = 0;
        fy += -this._host.world.gravityForce.y * m;
        fy += -1 * 0.5 * this.atmosphericDensity * this.dragCoefficient * this.area * v.y * v.y;
        dy = v.y * dt + (0.5 * ay * dt * dt);
        new_ay = fy / m;
        avg_ay = 0.5 * (new_ay + ay);
        v.y += avg_ay * dt;
        ay = avg_ay;
        p.y += dy * 10;
    }
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
