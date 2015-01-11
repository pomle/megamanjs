Engine.assets.Object = function()
{
    this.uuid = THREE.Math.generateUUID();
    this.collision = [];
    this.gravityForce = 0;
    this.isSupported = false;
    this.speed = new THREE.Vector2();
    this.scene = undefined;
}

Engine.assets.Object.prototype.addCollisionZone = function(r, offsetX, offsetY)
{
    this.collision.push({'radius': r, 'x': offsetX, 'y': offsetY});
}

Engine.assets.Object.prototype.collides = function(withObject, ourZone, theirZone)
{
    console.log('%s collides with %s', this.uuid, withObject.uuid);
    //console.log(withObject, ourZone, theirZone);
}

Engine.assets.Object.prototype.setGravity = function(force)
{
    this.gravityForce = force;
}

Engine.assets.Object.prototype.setModel = function(model)
{
    this.model = model;
}

Engine.assets.Object.prototype.setScene = function(scene)
{
    if (scene instanceof Engine.Scene !== true) {
        throw new Error('Invalid scene');
    }
    this.scene = scene;
}

Engine.assets.Object.prototype.setSpeed = function(x, y)
{
    this.speed.x = x;
    this.speed.y = y;
}

Engine.assets.Object.prototype.timeShift = function(t)
{
    var obstacleY = -148;

    this.model.position.x += (this.speed.x * t);
    this.model.position.y += (this.speed.y * t);

    if (!this.isSupported) {
        this.speed.y -= this.gravityForce;
    }

    if (this.model.position.y < obstacleY + 10) {
        this.isSupported = true;
    }

    if (this.model.position.y < obstacleY) {
        this.speed.y = 0;
        this.model.position.y = obstacleY;
    }
    else if (this.model.position.y > obstacleY) {
        this.isSupported = false;
    }
}

// Set up a default model.
Engine.assets.Object.prototype.model = new THREE.Mesh(
    new THREE.PlaneBufferGeometry(10, 10),
    new THREE.MeshBasicMaterial({
        wireframe: true,
        color: 'blue'
    }));

Engine.assets.objects = {};
