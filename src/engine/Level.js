Engine.scenes.Level = function()
{
    Engine.Scene.call(this);
    this.camera.camera.position.z = 120;
    this.collision = new Engine.Collision();
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

Engine.scenes.Level.prototype.updateTime = function(timeElapsed)
{
    Engine.Scene.prototype.updateTime.call(this, timeElapsed);
    this.collision.detect();
    this.garbageCollectObjects();
}

Engine.scenes.levels = {};
