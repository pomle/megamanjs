const { Vector2 } = require('three');
const BoundingBox = require('./BoundingBox');
const Entity = require('./Object');
const Math = require('./Math');

class Collision
{
    constructor()
    {
        this.objects = [];
        this.collisionIndex = [];
        this.positionCache = [];

        this.garbage = [];

        this.collisionMaxDistanceSq = undefined;
    }
    addObject(object)
    {
        if (object instanceof Entity !== true) {
            throw new TypeError('Collidable wrong type');
        }
        this.objects.push(object);
        this.collisionIndex.push([]);
        this.positionCache.push(new Vector2().set());
    }
    garbageCollect()
    {
        let object;
        let index;
        while (object = this.garbage.pop()) {
            while ((index = this.objects.indexOf(object)) !== -1) {
                this.objects.splice(index, 1);
                this.collisionIndex.splice(index, 1);
                this.positionCache.splice(index, 1);
           }
        }
    }
    removeObject(object)
    {
        this.garbage.push(object);
    }
    objectNeedsRecheck(index)
    {
        const o = this.objects[index];
        const p = this.positionCache[index];
        if (p.equals(o.position)) {
            return false;
        }
        return true;
    }
    updatePositionCache(index)
    {
        this.positionCache[index].copy(this.objects[index].position);
    }
    detect()
    {
        this.garbageCollect();

        for (let i = 0, l = this.objects.length; i !== l; ++i) {
            if (this.objects[i].collidable && this.objectNeedsRecheck(i)) {
                for (let j = 0; j !== l; ++j) {
                    if (i !== j && this.objects[j].collidable) {
                        this.objectIndexesCollide(i, j);
                    }
                }
            }
        }

        for (let i = 0, l = this.objects.length; i !== l; ++i) {
            this.updatePositionCache(i);
        }
    }
    objectIndexesCollide(i, j)
    {
        const o1 = this.objects[i];
        const o2 = this.objects[j];

        if (this.objectsCollide(o1, o2)) {
            if (this.collisionIndex[i].indexOf(o2) < 0) {
                this.collisionIndex[i].push(o2);
            }
            return true;
        }
        else {
            const ix = this.collisionIndex[i].indexOf(o2);
            if (ix !== -1) {
                o1.uncollides(o2);
                o2.uncollides(o1);
                this.collisionIndex[i].splice(ix, 1);
            }
            return false;
        }
    }
    objectsCollide(o1, o2)
    {
        if (o1.position.distanceToSquared(o2.position) > this.collisionMaxDistanceSq) {
            return false;
        }

        for (let i = 0, l = o1.collision.length; i !== l; ++i) {
            const z1 = o1.collision[i];
            for (let j = 0, m = o2.collision.length; j !== m; ++j) {
                const z2 = o2.collision[j];
                if (this.zonesCollide(o1, z1, o2, z2)) {
                    o1.collides(o2, z1, z2);
                    o2.collides(o1, z2, z1);
                    return true;
                }
            }
        }
        return false;
    }
    setCollisionRadius(units)
    {
        this.collisionMaxDistanceSq = units * units;
    }
    zonesCollide(object1, zone1, object2, zone2)
    {
        return Math.Geometry.rectanglesIntersect(
            zone1.x, zone1.y, zone1.w, zone1.h,
            zone2.x, zone2.y, zone2.w, zone2.h);
    }
}

module.exports = Collision;
