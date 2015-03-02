Engine.assets.Object = function()
{
    this.uuid = THREE.Math.generateUUID();
    this.collision = [];
    this.emitter = undefined;
    this.mass = 0;
    this.isSupported = false;
    this.frictionSpeed = new THREE.Vector2();
    this.momentumSpeed = new THREE.Vector2();
    this.position = undefined;
    this.speed = new THREE.Vector2();
    this.scene = undefined;
    this.time = 0;
    this.deltaTime = 0;
}

Engine.assets.Object.prototype.addCollisionGeometry = function(geometry, offsetX, offsetY)
{
    var material = new THREE.MeshBasicMaterial({
        color: 'white',
        wireframe: true,
        side: THREE.DoubleSide,
    });
    var mesh = new THREE.Mesh(geometry, material);
    mesh.position.x = offsetX || 0;
    mesh.position.y = offsetY || 0;
    mesh.position.z = .01;
    this.collision.push(mesh);
    //this.model.add(mesh); // Show collision zone.
}

Engine.assets.Object.prototype.addCollisionRect = function(w, h, offsetX, offsetY)
{
    var rect = new THREE.PlaneGeometry(w, h, 1, 1);
    return this.addCollisionGeometry(rect, offsetX, offsetY);
}

Engine.assets.Object.prototype.addCollisionZone = function(r, offsetX, offsetY)
{
    var circle = new THREE.CircleGeometry(r, 8);
    return this.addCollisionGeometry(circle, offsetX, offsetY);
}

Engine.assets.Object.prototype.collides = function(withObject, ourZone, theirZone)
{
}

Engine.assets.Object.prototype.dropCollision = function()
{
    this.collision.length = 0;
}

Engine.assets.Object.prototype.setEmitter = function(character)
{
    if (character instanceof Engine.assets.objects.Character !== true) {
        throw new Error('Invalid user');
    }
    this.emitter = character;
}

Engine.assets.Object.prototype.setModel = function(model)
{
    this.model = model;
    this.position = this.model.position;
}

Engine.assets.Object.prototype.setScene = function(scene)
{
    if (scene instanceof Engine.Scene !== true) {
        throw new Error('Invalid scene');
    }
    this.scene = scene;
}

Engine.assets.Object.prototype.timeShift = function(dt)
{
    this.time += dt;
    this.deltaTime = dt;

    this.speed.add(this.frictionSpeed);
    this.speed.add(this.momentumSpeed);
    this.model.position.x += (this.speed.x * dt);
    this.model.position.y += (this.speed.y * dt);

    this.speed.x = 0;
    this.speed.y = 0;
    this.frictionSpeed.set(0, 0);
}

// Set up a default model.
Engine.assets.Object.prototype.model = new THREE.Mesh(
    new THREE.PlaneBufferGeometry(10, 10),
    new THREE.MeshBasicMaterial({
        wireframe: true,
        color: 'blue'
    }));

Engine.assets.objects = {};
