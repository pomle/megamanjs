Engine.traits.Physics = function()
{
    Engine.Trait.call(this);

    this.gravity = true;

    this.area = 0.04;
    this.atmosphericDensity = 1.225;
    this.dragCoefficient = .045;
    this.mass = 1;

    this.acceleration = new THREE.Vector2();
    this.force = new THREE.Vector2();


    this.inertia = new THREE.Vector2();
    this.momentum = new THREE.Vector2();
}

Engine.Util.extend(Engine.traits.Physics, Engine.Trait);

Engine.traits.Physics.prototype.NAME = 'physics';

/* Megaman is 132 cm tall according to lore. He is 24 pixels tall in
   the game world. This constant was derived from 24 px / 1.32 m. */
Engine.traits.Physics.prototype.UNIT_SCALE = 182;

Engine.traits.Physics.prototype.__obstruct = function(object, attack)
{
    switch (attack) {
        case object.SURFACE_TOP:
        case object.SURFACE_BOTTOM:
            this._host.velocity.copy(object.velocity);
            break;
    }
}

var ax = 0;
var ay = 0;

Engine.traits.Physics.prototype.__timeshift = function physicsTimeshift(dt)
{
    if (dt !== 0) {
        var v = this._host.velocity,
            m = this.mass,
            ρ = this.atmosphericDensity,
            cd = this.dragCoefficient,
            A = this.area;

        var f = new THREE.Vector2(0, 0);
        f.y += -this._host.world.gravityForce.y * m;

        f.add(this.inertia.clone().multiplyScalar(m));
        f.add(this.momentum.clone().multiplyScalar(m));

        /* Take absolute value of velocity and use for v^2 calculation
           to enable us to cleanly apply it as force - resistance. */
        var px = Math.abs(v.x),
            py = Math.abs(v.y),
            res_x = .5 * ρ * cd * A * v.x * px,
            res_y = .5 * ρ * cd * A * v.y * py;

        console.log("Force: %f,%f, Resistance: %f,%f, Result: %f,%f", f.x, f.y, res_x, res_y, f.x - res_x, f.y - res_y);

        f.x -= res_x;
        f.y -= res_y;

        this.acceleration.x = f.x / m;
        this.acceleration.y = f.y / m;

        v.add(this.acceleration);
    }

    this.inertia.set(0,0);
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
