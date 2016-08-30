'use strict';

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
    this.direction = new THREE.Vector2(this.DIRECTION_RIGHT, 0);
    this.emitter = undefined;
    this.events = new Engine.Events(this);
    this.id = undefined;
    this.integrator = new Engine.Verlet(new THREE.Vector2);
    this.origo = new THREE.Vector2();
    this.position = new THREE.Vector3();
    this.sequencer = new Engine.SequenceManager(this);
    this.time = 0;
    this.timeStretch = 1;
    this.traits = [];
    this.velocity = new THREE.Vector2;
    this.world = undefined;

    this.doFor = Engine.Loops.doFor(this.events, this.EVENT_TIMESHIFT);
    this.waitFor = Engine.Loops.waitFor(this.events, this.EVENT_TIMESHIFT);

    if (this.geometry && this.material) {
        this.setModel(new THREE.Mesh(this.geometry, this.material));
    }
}

Engine.Object.prototype.DIRECTION_UP = 1;
Engine.Object.prototype.DIRECTION_DOWN = -1;
Engine.Object.prototype.DIRECTION_LEFT = -1;
Engine.Object.prototype.DIRECTION_RIGHT = 1;

Engine.Object.prototype.EVENT_WORLD_ADD = 'world-add';
Engine.Object.prototype.EVENT_WORLD_REMOVE = 'world-remove';

Engine.Object.prototype.EVENT_COLLIDE = 'collide';
Engine.Object.prototype.EVENT_OBSTRUCT = 'obstruct';
Engine.Object.prototype.EVENT_TIMESHIFT = 'timeshift';
Engine.Object.prototype.EVENT_UNCOLLIDE = 'uncollide';

Engine.Object.prototype.EVENT_TRAIT_ATTACHED = 'trait-attached';

Engine.Object.prototype.SURFACE_TOP = 0;
Engine.Object.prototype.SURFACE_BOTTOM = 1;
Engine.Object.prototype.SURFACE_LEFT = 2;
Engine.Object.prototype.SURFACE_RIGHT = 3;

Engine.Object.prototype.audio = {};
Engine.Object.prototype.geometry = undefined;
Engine.Object.prototype.material = undefined;
Engine.Object.prototype.textures = {};

Engine.Object.prototype.addCollisionRect = function(w, h, offsetX, offsetY)
{
    const boundingBox = new Engine.Collision.BoundingBox(
        this.position,
        {x: w, y: h},
        {x: offsetX || 0, y: offsetY || 0}
    );
    this.collision.push(boundingBox);
}

Engine.Object.prototype.addCollisionZone = function(r, offsetX, offsetY)
{
    return this.addCollisionRect(r * 2, r * 2, offsetX, offsetY);
}

Engine.Object.prototype.applyTrait = function(trait)
{
    if (trait instanceof Engine.Trait === false) {
        console.error(trait);
        throw new Error('Invalid trait');
    }
    if (this[trait.NAME] !== undefined) {
        throw new Error('Trait name "' + trait.NAME + '" occupied');
    }
    trait.__attach(this);
    this.traits.push(trait);
    this[trait.NAME] = trait;
    this.events.trigger(this.EVENT_TRAIT_ATTACHED, [trait]);
}

Engine.Object.prototype.collides = function(withObject, ourZone, theirZone)
{
    this.events.trigger(this.EVENT_COLLIDE, [withObject, ourZone, theirZone]);
}

Engine.Object.prototype.dropCollision = function()
{
    this.collision.length = 0;
}

Engine.Object.prototype.emitAudio = function(audio)
{
    if (this.world) {
        this.world.emitAudio(audio);
    }
}

Engine.Object.prototype.getModel = function()
{
    return this.model;
}

Engine.Object.prototype.getTrait = function(traitReference)
{
    for (let i = 0, l = this.traits.length; i < l; ++i) {
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
    const vec = this.position.clone();
    vec.x += x || 0;
    vec.y += y || 0;
    this.moveTo(vec);
}

Engine.Object.prototype.obstruct = function(object, attack, ourZone, theirZone)
{
    this.events.trigger(this.EVENT_OBSTRUCT, [object, attack, ourZone, theirZone]);
}

Engine.Object.prototype.reset = function()
{
    this.aim.set(0, 0);
    this.traits.forEach(trait => {
        if (typeof trait.reset === 'function') {
            trait.reset();
        }
    });
}

Engine.Object.prototype.removeFromWorld = function()
{
    if (this.world) {
        this.world.removeObject(this);
    }
}

Engine.Object.prototype.routeAnimation = function()
{
    return null;
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
    this.model = model;
    this.position = this.model.position;
}

Engine.Object.prototype.setWorld = function(world)
{
    if (world instanceof Engine.World === false) {
        throw new Error('Invalid world');
    }
    this.world = world;
    this.events.trigger(this.EVENT_WORLD_ADD);
}

Engine.Object.prototype.timeShift = function(deltaTime)
{
    const adjustedDelta = deltaTime * this.timeStretch;
    this.deltaTime = adjustedDelta;

    const anim = this.routeAnimation();
    if (anim) {
        this.setAnimation(anim);
    }

    if (this.aim.x !== 0) {
        this.direction.x = this.aim.x > 0 ? 1 : -1;
    }
    if (this.aim.y === 0) {
        this.direction.y = 0;
    } else {
        this.direction.y = this.aim.y > 0 ? 1 : -1;
    }

    if (this.model !== undefined && this.direction.x !== 0) {
        this.model.rotation.y = this.direction.x === 1 ? 0 : Math.PI;
    }

    this.events.trigger(this.EVENT_TIMESHIFT, [adjustedDelta, this.time]);

    this.integrator.integrate(this.position, this.velocity, adjustedDelta);

    this.time += adjustedDelta;
}

Engine.Object.prototype.updateAnimators = function(deltaTime)
{
    const adjustedDelta = deltaTime * this.timeStretch;
    this.animators.forEach(animator => {
        animator.update(adjustedDelta);
    });
}

Engine.Object.prototype.uncollides = function(withObject)
{
    this.events.trigger(this.EVENT_UNCOLLIDE, [withObject]);
}

Engine.Object.prototype.unsetWorld = function() {
    this.events.trigger(this.EVENT_WORLD_REMOVE);
    this.world = undefined;
}

Engine.objects = {};
Engine.objects.characters = {};
