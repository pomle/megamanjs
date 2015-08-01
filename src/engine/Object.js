Engine.Object = function()
{
    Engine.Events.call(this);

    this.uuid = THREE.Math.generateUUID();
    this.collidable = true;
    this.collision = [];
    this.deltaTime = 0;
    this.emitter = undefined;
    this.events = {};
    this.obstructible = true;
    this.position = undefined;
    this.time = 0;
    this.timeStretch = 1;
    this.traits = [];
    this.velocity = new THREE.Vector2();
    this.world = undefined;

    var model = new THREE.Mesh(this.geometry, this.material);
    this.setModel(model);
}

Engine.Util.mixin(Engine.Object, Engine.Events);

Engine.Object.prototype.EVENT_COLLIDE = 'collide';
Engine.Object.prototype.EVENT_OBSTRUCT = 'obstruct';
Engine.Object.prototype.EVENT_TIMESHIFT = 'timeshift';
Engine.Object.prototype.EVENT_UNCOLLIDE = 'uncollide';

Engine.Object.prototype.geometry = new THREE.PlaneBufferGeometry(10, 10);
Engine.Object.prototype.material = new THREE.MeshBasicMaterial({color: 'blue', wireframe: true});

Engine.Object.prototype.addCollisionGeometry = function(geometry, offsetX, offsetY)
{
    var material = new THREE.MeshBasicMaterial({
        color: 'white',
        wireframe: true,
        side: THREE.DoubleSide,
    });
    var mesh = new THREE.Mesh(geometry, material);
    mesh.position.x = offsetX || 0;
    mesh.position.y = offsetY || 0;
    mesh.position.z = 0;
    this.collision.push(mesh);
    return mesh;
}

Engine.Object.prototype.addCollisionRect = function(w, h, offsetX, offsetY)
{
    var rect = new THREE.PlaneGeometry(w, h, 1, 1);
    return this.addCollisionGeometry(rect, offsetX, offsetY);
}

Engine.Object.prototype.addCollisionZone = function(r, offsetX, offsetY)
{
    var circle = new THREE.CircleGeometry(r, 8);
    return this.addCollisionGeometry(circle, offsetX, offsetY);
}

Engine.Object.prototype.applyTrait = function(trait)
{
    if (trait instanceof Engine.Trait === false) {
        throw new Error('Invalid trait');
    }
    trait.__attach(this);
    this.traits.push(trait);
    return trait;
}

Engine.Object.prototype.collides = function(withObject, ourZone, theirZone)
{
    this.trigger(this.EVENT_COLLIDE, [withObject, ourZone, theirZone]);
}

Engine.Object.prototype.dropCollision = function()
{
    this.collision.length = 0;
}

Engine.Object.prototype.moveTo = function(vec)
{
    this.position.x = vec.x;
    this.position.y = vec.y;
}

Engine.Object.prototype.obstruct = function(object, attack)
{
    this.trigger(this.EVENT_OBSTRUCT, [object, attack]);
}

Engine.Object.prototype.setEmitter = function(object)
{
    if (object instanceof Engine.Object !== true) {
        throw new Error('Invalid emitter');
    }
    this.emitter = object;
}

Engine.Object.prototype.setModel = function(model)
{
    this.model = model;
    this.position = this.model.position;
}

Engine.Object.prototype.setWorld = function(world)
{
    if (world instanceof Engine.World === false) {
        throw new Error('Invalid world');
    }
    this.world = world;
}

Engine.Object.prototype.timeShift = function(deltaTime)
{
    this.time += deltaTime;
    this.deltaTime = deltaTime;

    this.trigger(this.EVENT_TIMESHIFT, [deltaTime]);

    this.position.x += (this.velocity.x * deltaTime);
    this.position.y += (this.velocity.y * deltaTime);
}

Engine.Object.prototype.uncollides = function(withObject)
{
    this.trigger(this.EVENT_UNCOLLIDE, [withObject]);
}
