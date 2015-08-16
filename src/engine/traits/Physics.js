Engine.traits.Physics = function()
{
    Engine.Trait.call(this);

    this.gravity = true;

    this.area = 0.04;
    this.atmosphericDensity = 1.225;
    this.dragCoefficient = .045;
    this.mass = 0;

    this.acceleration = new THREE.Vector2();
    this.force = new THREE.Vector2();
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

Engine.traits.Physics.prototype.__timeshift = function physicsTimeshift(dt)
{
    if (dt !== 0) {
        var v = this._host.velocity,
            g = this._host.world.gravityForce,
            a = this.acceleration,
            F = this.force,
            m = this.mass;

        F.y -= g.y;
        F.multiplyScalar(m);

        var Fd = this.calculateDrag(v);
        F.add(Fd);
        console.log("Force: %f,%f, Resistance: %f,%f, Result: %f,%f", F.x, F.y, Fd.x, Fd.y, F.x - Fd.x, F.y - Fd.y);

        a.x = F.x / m;
        a.y = F.y / m;

        v.add(a);

        F.set(0, 0);
    }

    this.inertia.set(0,0);
}

Engine.traits.Physics.prototype.calculateDrag = function(v)
{
    var ρ = this.atmosphericDensity,
        Cd = this.dragCoefficient,
        A = this.area;
    /* Take absolute value of velocity and use for v^2 calculation
       to enable us to cleanly apply it as force - drag. */
    return new THREE.Vector2(-.5 * ρ * Cd * A * v.x * Math.abs(v.x),
                             -.5 * ρ * Cd * A * v.y * Math.abs(v.y));
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
