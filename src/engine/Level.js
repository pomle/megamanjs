Engine.scenes.Level = function()
{
    Engine.Scene.call(this);
    this.camera.camera.position.z = 150;
    this.checkPoints = [];
    this.collision = new Engine.Collision();
    this.gravityForce = new THREE.Vector2();
}

Engine.scenes.Level.prototype = Object.create(Engine.Scene.prototype);
Engine.scenes.Level.prototype.constructor = Engine.scenes.Level;

Engine.scenes.Level.prototype.addCheckPoint = function(x, y, r)
{
    this.checkPoints.push({
        'pos': new THREE.Vector2(x, y),
        'radius': r || 100,
    });
}

Engine.scenes.Level.prototype.addObject = function(object, x, y)
{
    object.model.position.x = x === undefined ? object.model.position.x : x;
    object.model.position.y = y === undefined ? object.model.position.y : y;
    Engine.Scene.prototype.addObject.call(this, object);
    this.collision.addObject(object);
    object.setScene(this);
}

Engine.scenes.Level.prototype.applyGravity = function(object, dt)
{
    if (this.gravityForce.x == 0 && this.gravityForce.y == 0) {
        return;
    }

    if (!object.physics || object.mass == 0) {
        return;
    }

    object.inertia.x += -this.gravityForce.x * dt * object.timeStretch;
    object.inertia.y += -this.gravityForce.y * dt * object.timeStretch;
}

Engine.scenes.Level.prototype.applyModifiers = function(object, dt)
{
    this.applyGravity(object, dt);
    Engine.Scene.prototype.applyModifiers.call(this, object, dt);
}

Engine.scenes.Level.prototype.removeObject = function(o)
{
    Engine.Scene.prototype.removeObject.call(this, o);
    this.collision.removeObject(o);
}

Engine.scenes.Level.prototype.updateTime = function(dt)
{
    Engine.Scene.prototype.updateTime.call(this, dt);
    this.collision.detect();
}
