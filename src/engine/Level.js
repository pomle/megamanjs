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

Engine.scenes.Level.prototype.applyGravity = function(x, y)
{
    if (x || y) {
        var i, o, l = this.objects.length;
        for (i = 0; i < l; i++) {
            if (this.objects[i].mass) {
                this.objects[i].inertia.x += -x;
                this.objects[i].inertia.y += -y;
            }
        }
    }
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
    this.applyGravity(this.gravityForce.x * dt, this.gravityForce.y * dt);
    Engine.Scene.prototype.updateTime.call(this, dt);

    this.collision.detectQuad();
    /* After collision, some objects might have decided to remove
    themselves from the pool, so we make a GC. */
    this.garbageCollectObjects();
}
