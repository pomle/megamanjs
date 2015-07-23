Engine.assets.Object = function()
{
    this.uuid = THREE.Math.generateUUID();
    this.collidable = true;
    this.collision = [];
    this.deltaTime = 0;
    this.emitter = undefined;
    this.events = {};
    this.inertia = new THREE.Vector2();
    this.mass = 0;
    this.momentum = new THREE.Vector2();
    this.obstructible = true;
    this.physics = true;
    this.position = undefined;
    this.scene = undefined;
    this.time = 0;
    this.timeStretch = 1;
    this.velocity = new THREE.Vector2();

    var model = new THREE.Mesh(Engine.assets.Object.defaultGeometry,
                               Engine.assets.Object.defaultMaterial);
    this.setModel(model);
}

Engine.assets.Object.defaultGeometry = new THREE.PlaneBufferGeometry(10, 10);
Engine.assets.Object.defaultMaterial = new THREE.MeshBasicMaterial({color: 'blue', wireframe: true});
Engine.assets.Object.exposeCollisionGeometry = false;

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
    mesh.position.z = 0;
    this.collision.push(mesh);
    return mesh;
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

Engine.assets.Object.prototype.bind = function(name, callback)
{
    if (!this.events[name]) {
        this.events[name] = [];
    }
    this.events[name].push(callback);
}

Engine.assets.Object.prototype.collides = function(withObject, ourZone, theirZone)
{
}

Engine.assets.Object.prototype.dropCollision = function()
{
    this.collision.length = 0;
}

Engine.assets.Object.prototype.moveTo = function(vec)
{
    this.position.x = vec.x;
    this.position.y = vec.y;
}

Engine.assets.Object.prototype.obstruct = function(solid, attack)
{
    if (solid instanceof Engine.assets.Solid === false) {
        throw new Error('Invalid solid');
    }

    switch (attack) {
        case solid.TOP:
            this.inertia.copy(solid.velocity);
            this.isSupported = true;
            break;

        case solid.BOTTOM:
            this.inertia.copy(solid.velocity);
            this.jumpEnd();
            break;

        case solid.LEFT:
        case solid.RIGHT:
            this.moveSpeed = Math.abs(solid.velocity.x);
            break;
    }
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

    if (this.physics) {
        this.velocity.set(0, 0);
        this.velocity.add(this.inertia);
        this.velocity.add(this.momentum);

        this.model.position.x += (this.velocity.x * dt);
        this.model.position.y += (this.velocity.y * dt);
    }
}

Engine.assets.Object.prototype.trigger = function(name)
{
    if (this.events[name]) {
        var i,
            l = this.events[name].length,
            event;

        for (i = 0; i < l; i++) {
            event = this.events[name][i];
            if (event) {
                event(this, arguments);
            }
        }
    }
}


Engine.assets.Object.prototype.unbind = function(name, callback)
{
    if (this.events[name]) {
        var index = this.events[name].indexOf(callback);
        if (index > -1) {
            this.events[name].splice(index, 1);
        }
    }
}

Engine.assets.Object.prototype.uncollides = function(withObject)
{
}

Engine.assets.objects = {};
