Engine.Object = function()
{
    this.uuid = THREE.Math.generateUUID();
    this.collidable = true;
    this.collision = [];
    this.deltaTime = 0;
    this.emitter = undefined;
    this.events = {};
    this.obstructible = true;
    this.position = undefined;
    this.scene = undefined;
    this.time = 0;
    this.timeStretch = 1;
    this.traits = [];
    this.velocity = new THREE.Vector2();

    this.applyTrait(new Engine.traits.Physics());

    var model = new THREE.Mesh(this.geometry, this.material);
    this.setModel(model);
}

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
    if (trait instanceof Engine.Trait === false || !trait.NAME) {
        throw new Error('Invalid trait or trait name');
    }
    if (this[trait.NAME]) {
        throw new Error('Trait "' + trait.NAME + '" property occupied');
    }
    trait.object = this;
    this.traits.push(trait);
    this[trait.NAME] = trait;
}

Engine.Object.prototype.bind = function(name, callback)
{
    if (!this.events[name]) {
        this.events[name] = [];
    }
    this.events[name].push(callback);
}

Engine.Object.prototype.collides = function(withObject, ourZone, theirZone)
{
    for (var i in this.traits) {
        if (this.traits[i].__collides) {
            var trait = this.traits[i];
            trait.__collides.apply(trait, arguments);
        }
    }
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

Engine.Object.prototype.obstruct = function(solid, attack)
{
    if (solid instanceof Game.objects.Solid === false) {
        throw new Error('Invalid solid');
    }

    switch (attack) {
        case solid.TOP:
            this.physics.inertia.copy(solid.velocity);
            this.isSupported = true;
            break;

        case solid.BOTTOM:
            this.physics.inertia.copy(solid.velocity);
            this.jumpEnd();
            break;

        case solid.LEFT:
        case solid.RIGHT:
            this.moveSpeed = Math.abs(solid.velocity.x);
            break;
    }
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

Engine.Object.prototype.setScene = function(scene)
{
    if (scene instanceof Engine.Scene !== true) {
        throw new Error('Invalid scene');
    }
    this.scene = scene;
}

Engine.Object.prototype.timeShift = function(dt)
{
    this.time += dt;
    this.deltaTime = dt;

    for (var i in this.traits) {
        if (this.traits[i].__timeshift) {
            var trait = this.traits[i];
            trait.__timeshift.apply(trait, arguments);
        }
    }

    this.position.x += (this.velocity.x * dt);
    this.position.y += (this.velocity.y * dt);
}

Engine.Object.prototype.trigger = function(name)
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


Engine.Object.prototype.unbind = function(name, callback)
{
    if (this.events[name]) {
        var index = this.events[name].indexOf(callback);
        if (index > -1) {
            this.events[name].splice(index, 1);
        }
    }
}

Engine.Object.prototype.uncollides = function(withObject)
{
}
