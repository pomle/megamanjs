const THREE = require('three');
const BoundingBox = require('./BoundingBox');
const Events = require('./Events');
const Loops = require('./Loops');
const SequenceManager = require('./SequenceManager');
const Verlet = require('./Verlet');

const Object = function()
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

Object.prototype.DIRECTION_UP = 1;
Object.prototype.DIRECTION_DOWN = -1;
Object.prototype.DIRECTION_LEFT = -1;
Object.prototype.DIRECTION_RIGHT = 1;

Object.prototype.EVENT_WORLD_ADD = 'world-add';
Object.prototype.EVENT_WORLD_REMOVE = 'world-remove';

Object.prototype.EVENT_COLLIDE = 'collide';
Object.prototype.EVENT_OBSTRUCT = 'obstruct';
Object.prototype.EVENT_TIMESHIFT = 'timeshift';
Object.prototype.EVENT_UNCOLLIDE = 'uncollide';

Object.prototype.EVENT_TRAIT_ATTACHED = 'trait-attached';

Object.prototype.SURFACE_TOP = 0;
Object.prototype.SURFACE_BOTTOM = 1;
Object.prototype.SURFACE_LEFT = 2;
Object.prototype.SURFACE_RIGHT = 3;

Object.prototype.audio = {};
Object.prototype.geometry = undefined;
Object.prototype.material = undefined;
Object.prototype.textures = {};

Object.prototype.addCollisionRect = function(w, h, offsetX, offsetY)
{
    const boundingBox = new BoundingBox(
        this.position,
        {x: w, y: h},
        {x: offsetX || 0, y: offsetY || 0}
    );
    this.collision.push(boundingBox);
}

Object.prototype.addCollisionZone = function(r, offsetX, offsetY)
{
    return this.addCollisionRect(r * 2, r * 2, offsetX, offsetY);
}

Object.prototype.applyTrait = function(trait)
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

Object.prototype.collides = function(withObject, ourZone, theirZone)
{
    this.events.trigger(this.EVENT_COLLIDE, [withObject, ourZone, theirZone]);
}

Object.prototype.dropCollision = function()
{
    this.collision.length = 0;
}

Object.prototype.emitAudio = function(audio)
{
    if (this.world) {
        this.world.emitAudio(audio);
    }
}

Object.prototype.getModel = function()
{
    return this.model;
}

Object.prototype.getTrait = function(traitReference)
{
    for (let i = 0, l = this.traits.length; i < l; ++i) {
        if (this.traits[i] instanceof traitReference) {
            return this.traits[i];
        }
    }
    return false;
}

Object.prototype.moveTo = function(vec)
{
    this.position.x = vec.x;
    this.position.y = vec.y;
}

Object.prototype.nudge = function(x, y)
{
    const vec = this.position.clone();
    vec.x += x || 0;
    vec.y += y || 0;
    this.moveTo(vec);
}

Object.prototype.obstruct = function(object, attack, ourZone, theirZone)
{
    this.events.trigger(this.EVENT_OBSTRUCT, [object, attack, ourZone, theirZone]);
}

Object.prototype.reset = function()
{
    this.aim.set(0, 0);
    this.traits.forEach(trait => {
        if (typeof trait.reset === 'function') {
            trait.reset();
        }
    });
}

Object.prototype.removeFromWorld = function()
{
    if (this.world) {
        this.world.removeObject(this);
    }
}

Object.prototype.routeAnimation = function()
{
    return null;
}

Object.prototype.setAnimation = function(name)
{
    if (name !== this.anim) {
        this.animators[0].setAnimation(this.animations[name]);
        this.anim = name;
    }
}

Object.prototype.setEmitter = function(object)
{
    if (object instanceof Object !== true) {
        throw new Error('Invalid emitter');
    }
    this.emitter = object;
}

Object.prototype.setModel = function(model)
{
    this.model = model;
    this.position = this.model.position;
}

Object.prototype.setWorld = function(world)
{
    if (world instanceof Engine.World === false) {
        throw new Error('Invalid world');
    }
    this.world = world;
    this.events.trigger(this.EVENT_WORLD_ADD);
}

Object.prototype.timeShift = function(deltaTime)
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

Object.prototype.updateAnimators = function(deltaTime)
{
    const adjustedDelta = deltaTime * this.timeStretch;
    this.animators.forEach(animator => {
        animator.update(adjustedDelta);
    });
}

Object.prototype.uncollides = function(withObject)
{
    this.events.trigger(this.EVENT_UNCOLLIDE, [withObject]);
}

Object.prototype.unsetWorld = function() {
    this.events.trigger(this.EVENT_WORLD_REMOVE);
    this.world = undefined;
}

module.exports = Object;
