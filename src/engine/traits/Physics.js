Engine.traits.Physics = function()
{
    Engine.Trait.call(this);

    this.gravity = true;

    this.area = 0.1;
    this.atmosphericDensity = 1.2;
    this.dragCoefficient = .47;
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
        var v = this._host.velocity;
        var p = this._host.position;
        var m = this.mass;

        var f = new THREE.Vector2(0, 0);
        f.y += -this._host.world.gravityForce.y * m;

        f.add(this.inertia.clone().multiplyScalar(m));
        f.add(this.momentum.clone().multiplyScalar(m));

        var vx = v.x;
        var vy = v.y;

        var res = new THREE.Vector2(0, 0);
        var fT = f.length();
        var vT = v.length();
        //console.log(vT, vx, vy);
        var resT = .5 * this.atmosphericDensity * this.dragCoefficient * this.area * vT * vT;
        //res.x = 0.5 * this.atmosphericDensity * this.dragCoefficient * this.area * vx * vx;
        //res.y = 0.5 * this.atmosphericDensity * this.dragCoefficient * this.area * vy * vy;
        var resultT = fT - resT;
        console.log("Force: %s, Resistance: %s, Result: %s", fT, resT, resultT);

        f.setLength(resultT);

        var dx = v.x * dt + (0.5 * ax * dt * dt);
        var dy = v.y * dt + (0.5 * ay * dt * dt);

        this.acceleration.x = f.x / m;
        this.acceleration.y = f.y / m;

        var avg_acc = new THREE.Vector2(0, 0);
        avg_acc.x = 0.5 * (this.acceleration.x + ax);
        avg_acc.y = 0.5 * (this.acceleration.y + ay);

        v.x += avg_acc.x * dt;
        v.y += avg_acc.y * dt;

        ax = avg_acc.x;
        ay = avg_acc.y;

        p.x += dx * this.UNIT_SCALE;
        p.y += dy * this.UNIT_SCALE;
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
