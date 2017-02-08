const AI = require('../AI');
const Entity = require('../Object');

class Spawner extends Entity
{
    constructor()
    {
        super();

        this._accumulatedTime = 0;
        this._children = [];
        this._spawnCount = 0;

        this.ai = new AI(this);
        this.childLifetime = null;
        this.interval = 1;
        this.maxDistance = null;
        this.minDistance = null;
        this.maxSimultaneousSpawns = 1;
        this.maxTotalSpawns = Infinity;
        this.pool = [];
        this.roamingLimit = null;
    }
    _cleanReferences()
    {
        const w = this.world;
        this._children = this._children.filter(child => {
            return w.hasObject(child);
        });
    }
    _killOffElderly()
    {
        this._children = this._children.filter(child => {
            if (child.time >= this.childLifetime) {
                child.health.kill();
                return false;
            }
            return true;
        });
    }
    _killOffRoaming()
    {
        const world = this.world;
        this._children = this._children.filter(child => {
            if (child.position.distanceTo(this.position) > this.roamingLimit) {
                child.health.kill();
                return false;
            } else {
                return true;
            }
        });
    }
    getChildren()
    {
        return this._children;
    }
    reset()
    {
        const children = this._children;
        children.forEach(child => {
            this.world.removeObject(child);
        });
        this._children = [];
        this._accumulatedTime = 0;
        this._spawnCount = 0;
    }
    spawnObject()
    {
        if (this.pool.length === 0) {
            return false;
        }
        if (this._children.length >= this.maxSimultaneousSpawns) {
            return false;
        }
        if (this._spawnCount >= this.maxTotalSpawns) {
            return false;
        }

        if (this.minDistance || this.maxDistance) {
            const player = this.ai.findPlayer();
            if (player) {
                const dist = this.position.distanceTo(player.position);
                if (this.maxDistance && dist > this.maxDistance ||
                    this.minDistance && dist < this.minDistance) {
                    return false;
                }
            }
        }

        const index = Math.floor(Math.random() * this.pool.length);
        const object = new this.pool[index]();

        object.position.copy(this.position);
        object.position.z = 0;

        this._children.push(object);
        this.world.addObject(object);

        ++this._spawnCount;

        return object;
    }
    timeShift(dt)
    {
        this._accumulatedTime += dt;
        if (this.childLifetime !== null) {
            this._killOffElderly();
        }
        if (this.roamingLimit !== null) {
            this._killOffRoaming();
        }
        if (this.interval > 0 && this._accumulatedTime >= this.interval) {
            let overdue = Math.floor(this._accumulatedTime / this.interval);
            this._accumulatedTime -= overdue * this.interval;
            this._cleanReferences();
            while (overdue--) {
                if (!this.spawnObject()) {
                    break;
                }
            }
        }
    }
}

module.exports = Spawner;
