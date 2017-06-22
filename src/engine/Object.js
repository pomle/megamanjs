function Entity()
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
    this.events = new Events(this);
    this.id = undefined;
    this.integrator = new Verlet(new THREE.Vector2);
    this.origo = new THREE.Vector2();
    this.position = new THREE.Vector3();
    this.sequencer = new SequenceManager(this);
    this.time = 0;
    this.timeStretch = 1;
    this.traits = [];
    this.velocity = new THREE.Vector2;
    this.world = undefined;

    this.doFor = Loops.doFor(this.events, this.EVENT_TIMESHIFT);
    this.waitFor = Loops.waitFor(this.events, this.EVENT_TIMESHIFT);

    if (this.geometry && this.material) {
        this.setModel(new THREE.Mesh(this.geometry, this.material));
    }
}

Entity.prototype.DIRECTION_UP = 1;
Entity.prototype.DIRECTION_DOWN = -1;
Entity.prototype.DIRECTION_LEFT = -1;
Entity.prototype.DIRECTION_RIGHT = 1;

Entity.prototype.EVENT_WORLD_ADD = 'world-add';
Entity.prototype.EVENT_WORLD_REMOVE = 'world-remove';

Entity.prototype.EVENT_COLLIDE = 'collide';
Entity.prototype.EVENT_OBSTRUCT = 'obstruct';
Entity.prototype.EVENT_TIMESHIFT = 'timeshift';
Entity.prototype.EVENT_UNCOLLIDE = 'uncollide';

Entity.prototype.EVENT_TRAIT_ATTACHED = 'trait-attached';

Entity.prototype.SURFACE_TOP = 0;
Entity.prototype.SURFACE_BOTTOM = 1;
Entity.prototype.SURFACE_LEFT = 2;
Entity.prototype.SURFACE_RIGHT = 3;

Entity.prototype.audio = {};
Entity.prototype.geometry = undefined;
Entity.prototype.material = undefined;
Entity.prototype.textures = {};

Entity.prototype.addCollisionRect = function(w, h, offsetX, offsetY)
{
    const boundingBox = new BoundingBox(
        this.position,
        {x: w, y: h},
        {x: offsetX || 0, y: offsetY || 0}
    );
    this.collision.push(boundingBox);
}

Entity.prototype.addCollisionZone = function(r, offsetX, offsetY)
{
    return this.addCollisionRect(r * 2, r * 2, offsetX, offsetY);
}

Entity.prototype.applyTrait = function(trait)
{
    if (this[trait.NAME] !== undefined) {
        throw new Error('Trait name "' + trait.NAME + '" occupied');
    }
    trait.__attach(this);
    this.traits.push(trait);
    this[trait.NAME] = trait;
    this.events.trigger(this.EVENT_TRAIT_ATTACHED, [trait]);
}

Entity.prototype.collides = function(withObject, ourZone, theirZone)
{
    this.events.trigger(this.EVENT_COLLIDE, [withObject, ourZone, theirZone]);
}

Entity.prototype.dropCollision = function()
{
    this.collision.length = 0;
}

Entity.prototype.emitAudio = function(audio)
{
    if (this.world) {
        this.world.emitAudio(audio);
    }
}

Entity.prototype.getModel = function()
{
    return this.model;
}

Entity.prototype.getTrait = function(traitReference)
{
    for (let i = 0, l = this.traits.length; i < l; ++i) {
        if (this.traits[i] instanceof traitReference) {
            return this.traits[i];
        }
    }
    return false;
}

Entity.prototype.moveTo = function(vec)
{
    this.position.x = vec.x;
    this.position.y = vec.y;
}

Entity.prototype.nudge = function(x, y)
{
    const vec = this.position.clone();
    vec.x += x || 0;
    vec.y += y || 0;
    this.moveTo(vec);
}

Entity.prototype.obstruct = function(object, attack, ourZone, theirZone)
{
    this.events.trigger(this.EVENT_OBSTRUCT, [object, attack, ourZone, theirZone]);
}

Entity.prototype.reset = function()
{
    this.aim.set(0, 0);
    this.traits.forEach(trait => {
        if (typeof trait.reset === 'function') {
            trait.reset();
        }
    });
}

Entity.prototype.removeFromWorld = function()
{
    if (this.world) {
        this.world.removeObject(this);
    }
}

Entity.prototype.routeAnimation = function()
{
    return null;
}

Entity.prototype.setAnimation = function(name)
{
    if (name !== this.anim) {
        this.animators[0].setAnimation(this.animations[name]);
        this.anim = name;
    }
}

Entity.prototype.setEmitter = function(object)
{
    if (object instanceof Object !== true) {
        throw new Error('Invalid emitter');
    }
    this.emitter = object;
}

Entity.prototype.setModel = function(model)
{
    this.model = model;
    this.position = this.model.position;
}

Entity.prototype.setWorld = function(world)
{
    if (world instanceof World === false) {
        throw new Error('Invalid world');
    }
    this.world = world;
    this.events.trigger(this.EVENT_WORLD_ADD);
}

Entity.prototype.timeShift = function(deltaTime)
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

Entity.prototype.updateAnimators = function(deltaTime)
{
    const adjustedDelta = deltaTime * this.timeStretch;
    this.animators.forEach(animator => {
        animator.update(adjustedDelta);
    });
}

Entity.prototype.uncollides = function(withObject)
{
    this.events.trigger(this.EVENT_UNCOLLIDE, [withObject]);
}

Entity.prototype.unsetWorld = function() {
    this.events.trigger(this.EVENT_WORLD_REMOVE);
    this.world = undefined;
}

module.exports = Entity;

const THREE = require('three');
const BoundingBox = require('./BoundingBox');
const Events = require('./Events');
const Loops = require('./Loops');
const SequenceManager = require('./SequenceManager');
const Trait = require('./Trait');
const Verlet = require('./Verlet');
const World = require('./World');
