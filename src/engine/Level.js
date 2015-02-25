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
    Engine.Scene.prototype.updateTime.call(this, dt);

    /* We are applying gravity after every time step. This allows for
    step of weightlessness. This is purely incidental as of now. */
    if (this.gravityForce.x || this.gravityForce.y) {
        var i, o, l = this.objects.length;
        for (i = 0; i < l; i++) {
            if (this.objects[i].mass) {
                this.objects[i].momentumSpeed.x += -(this.gravityForce.x * dt);
                this.objects[i].momentumSpeed.y += -(this.gravityForce.y * dt);
            }
        }
    }

    this.collision.detect();
    /* After collision, some objects might have decided to remove
    themselves from the pool, so we make a GC. */
    this.garbageCollectObjects();
}

Engine.scenes.levels = {};
