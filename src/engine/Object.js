Engine.Object = function()
{
    this.uuid = THREE.Math.generateUUID();
    this.name = undefined;

    this.aim = new THREE.Vector2();
    this.anim = undefined;
    this.animators = [];
    this.collidable = true;
    this.collision = [];
    this.deltaTime = undefined;
    this.direction = new THREE.Vector2();
    this.emitter = undefined;
    this.events = new Engine.Events(this);
    this.integrator = new Engine.Verlet(new THREE.Vector2());
    this.origo = new THREE.Vector2();
    this.position = new THREE.Vector3();
    this.time = 0;
    this.timeStretch = 1;
    this.traits = [];
    this.velocity = new THREE.Vector2();
    this.world = undefined;

    if (this.geometry && this.material) {
        this.setModel(new THREE.Mesh(this.geometry, this.material));
    }
}

Engine.Object.prototype.DIRECTION_UP = 1;
Engine.Object.prototype.DIRECTION_DOWN = -1;
Engine.Object.prototype.DIRECTION_LEFT = -1;
Engine.Object.prototype.DIRECTION_RIGHT = 1;

Engine.Object.prototype.EVENT_COLLIDE = 'collide';
Engine.Object.prototype.EVENT_OBSTRUCT = 'obstruct';
Engine.Object.prototype.EVENT_TIMESHIFT = 'timeshift';
Engine.Object.prototype.EVENT_UNCOLLIDE = 'uncollide';

Engine.Object.prototype.SURFACE_TOP = 0;
Engine.Object.prototype.SURFACE_BOTTOM = 1;
Engine.Object.prototype.SURFACE_LEFT = 2;
Engine.Object.prototype.SURFACE_RIGHT = 3;

Engine.Object.prototype.geometry = undefined;
Engine.Object.prototype.material = undefined;
Engine.Object.prototype.textures = {};

Engine.Object.prototype.addCollisionRect = function(w, h, offsetX, offsetY)
{
    var boundingBox = new Engine.Collision.BoundingBox(
        this.position, {x: w, y: h}, {x: offsetX || 0, y: offsetY || 0});
    this.collision.push(boundingBox);
}

Engine.Object.prototype.addCollisionZone = function(r, offsetX, offsetY)
{
    return this.addCollisionRect(r * 2, r * 2, offsetX, offsetY);
}

Engine.Object.prototype.applyTrait = function(trait)
{
    if (trait instanceof Engine.Trait === false) {
        throw new Error('Invalid trait');
    }
    if (this[trait.NAME] !== undefined) {
        throw new Error('Trait name "' + trait.NAME + '" occupied');
    }
    trait.__attach(this);
    this.traits.push(trait);
    this[trait.NAME] = trait;
    return trait;
}

Engine.Object.prototype.collides = function(withObject, ourZone, theirZone)
{
    this.events.trigger(this.EVENT_COLLIDE, [withObject, ourZone, theirZone]);
}

Engine.Object.prototype.dropCollision = function()
{
    this.collision.length = 0;
}

Engine.Object.prototype.getTrait = function(traitReference)
{
    for (var i = 0, l = this.traits.length; i < l; ++i) {
        if (this.traits[i] instanceof traitReference) {
            return this.traits[i];
        }
    }
    return false;
}

Engine.Object.prototype.moveTo = function(vec)
{
    this.position.x = vec.x;
    this.position.y = vec.y;
}

Engine.Object.prototype.nudge = function(x, y)
{
    var vec = this.position.clone();
    vec.x += x || 0;
    vec.y += y || 0;
    this.moveTo(vec);
}

Engine.Object.prototype.obstruct = function(object, attack, ourZone, theirZone)
{
    this.events.trigger(this.EVENT_OBSTRUCT, [object, attack, ourZone, theirZone]);
}

Engine.Object.prototype.setAnimation = function(name)
{
    if (name !== this.anim) {
        this.animators[0].setAnimation(this.animations[name]);
        this.anim = name;
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
    if (this.collision.length) {
        throw new Error('Can not update model after collision');
    }
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
    this.deltaTime = deltaTime;

    if (this.model !== undefined && this.direction.x !== 0) {
        this.model.rotation.y = this.direction.x === 1 ? 0 : Math.PI;
    }

    this.events.trigger(this.EVENT_TIMESHIFT, [deltaTime, this.time]);

    this.integrator.integrate(this.position, this.velocity, deltaTime);

    this.time += deltaTime;
}

Engine.Object.prototype.updateAnimators = function(deltaTime) {
    var animators = this.animators;
    for (var i = 0, l = animators.length; i !== l; ++i) {
        animators[i].update(deltaTime);
    }
}

Engine.Object.prototype.uncollides = function(withObject)
{
    this.events.trigger(this.EVENT_UNCOLLIDE, [withObject]);
}

Engine.Object.prototype.unsetWorld = function() {
    this.world = undefined;
}
