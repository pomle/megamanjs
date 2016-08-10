'use strict';

Engine.World =
class World
{
    constructor()
    {
        this.EVENT_UPDATE = 'world-update';
        this.EVENT_SIMULATE = 'world-simulate';
        this.EVENT_EMIT_AUDIO = 'world-emit-audio';
        this.EVENT_ADD = 'world-add';
        this.EVENT_REMOVE = 'world-remove';

        this.ambientLight = new THREE.AmbientLight(0xffffff);

        this.collision = new Engine.Collision();

        this.events = new Engine.Events(this);
        this.doFor = Engine.Loops.doFor(this.events, this.EVENT_SIMULATE);
        this.waitFor = Engine.Loops.waitFor(this.events, this.EVENT_SIMULATE);

        this.atmosphericDensity = .1;
        this.atmosphericViscosity = .1;
        this.gravityForce = new THREE.Vector2(0, 9.81);
        this.windForce = new THREE.Vector2(0, 0);

        this.objects = [];
        this.objectsDead = [];

        this.scene = new THREE.Scene();
        this.scene.add(this.ambientLight);

        this._accumulator = 0;
        this._tick = 0;
        this._timeTotal = 0;

        this.timeStep = 1/120;
        this.timeStretch = 1;
    }
    addObject(object)
    {
        if (object instanceof Engine.Object === false) {
            throw new TypeError('Invalid object');
        }
        if (this.hasObject(object)) {
            return;
        }

        this.objects.push(object);
        this.objectsDead.push(false);
        this.collision.addObject(object);
        if (object.model) {
            this.scene.add(object.model);
        }
        object.setWorld(this);
        object.events.trigger(this.EVENT_ADD);
    }
    emitAudio(positionalAudio)
    {
        this.events.trigger(this.EVENT_EMIT_AUDIO, [positionalAudio]);
    }
    getObject(id)
    {
        for (let i = 0, l = this.objects.length; i !== l; ++i) {
            const object = this.objects[i];
            if (object.id === id) {
                return object;
            }
        }
        return false;
    }
    getObjects(name) {
        return this.objects.filter(o => o.name === name);
    }
    hasObject(object)
    {
        const index = this.objects.indexOf(object);
        return index !== -1 && this.objectsDead[index] === false;
    }
    removeObject(object)
    {
        if (object instanceof Engine.Object === false) {
            throw new TypeError('Invalid object');
        }
        const index = this.objects.indexOf(object);
        if (index !== -1) {
            this.objectsDead[index] = true;
            object.events.trigger(this.EVENT_REMOVE);
        }
    }
    _cleanObjects()
    {
        const dead = this.objectsDead;
        const objects = this.objects;
        for (let i = 0, l = objects.length; i !== l;) {
            if (dead[i] === true) {
                this._cleanObject(objects[i]);
                objects.splice(i, 1);
                dead.splice(i, 1);
                --l;
            } else {
                ++i;
            }
        }
    }
    _cleanObject(object)
    {
        object.unsetWorld();
        this.collision.removeObject(object);
        if (object.model) {
            this.scene.remove(object.model);
        }
    }
    simulateTime(deltaTime)
    {
        this._timeTotal += deltaTime;

        this.objects.forEach(object => {
            object.timeShift(deltaTime, this._timeTotal);
        });

        this.collision.detect();

        this._cleanObjects();

        if (deltaTime > 0) {
            this.events.trigger(this.EVENT_SIMULATE, [deltaTime, this._timeTotal, this._tick]);
            ++this._tick;
        }
    }
    updateAnimation(deltaTime)
    {
        this.objects.forEach(object => {
            object.updateAnimators(deltaTime);
        });
    }
    updateTime(deltaTime)
    {
        const adjustedDelta = deltaTime * this.timeStretch;
        const step = this.timeStep;

        this._accumulator += adjustedDelta;
        while (this._accumulator >= step) {
            this.simulateTime(step);
            this._accumulator -= step;
        }

        this.updateAnimation(adjustedDelta);
        this.events.trigger(this.EVENT_UPDATE, [adjustedDelta, this._timeTotal]);
    }
}