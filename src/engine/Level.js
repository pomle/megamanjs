Engine.scenes.Level = function()
{
    Engine.Scene.call(this);
    this.camera.camera.position.z = 120;
    this.collision = new Engine.Collision();
    this.gravityForce = new THREE.Vector2();
    this.startPosition = new THREE.Vector2();
}

Engine.scenes.Level.prototype = Object.create(Engine.Scene.prototype);
Engine.scenes.Level.prototype.constructor = Engine.scenes.Level;

Engine.scenes.Level.prototype.addObject = function(o, x, y)
{
    o.model.position.x = x === undefined ? o.model.position.x : x;
    o.model.position.y = y === undefined ? o.model.position.y : y;
    Engine.Scene.prototype.addObject.call(this, o);
    this.collision.addObject(o);
    o.setScene(this);
}

Engine.scenes.Level.prototype.removeObject = function(o)
{
    Engine.Scene.prototype.removeObject.call(this, o);
    this.collision.removeObject(o);
}

Engine.scenes.Level.prototype.addPlayer = function(player)
{
    this.addObject(player, this.startPosition.x, -this.startPosition.y);
    this.camera.follow(player);
}

Engine.scenes.Level.prototype.setStartPosition = function(x, y)
{
    this.startPosition.x = x;
    this.startPosition.y = y;
    this.camera.jumpTo(x, -y);
}

Engine.scenes.Level.prototype.updateTime = function(dt)
{
    var i, l, object;
    var objects = Engine.Scene.prototype.updateTime.call(this, dt);

    if (this.gravityForce.x || this.gravityForce.y) {
        l = objects.length;
        for (i = 0; i < l; i++) {
            object = objects[i];
            if (object.mass) {
                object.momentumSpeed.x += -(this.gravityForce.x * dt);
                object.momentumSpeed.y += -(this.gravityForce.y * dt);
            }
        }
    }

    this.collision.detect();
    this.garbageCollectObjects();
}

Engine.scenes.levels = {};
