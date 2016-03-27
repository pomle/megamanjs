Engine.Collision = function()
{
    this.objects = [];
    this.collisionIndex = [];
    this.positionCache = [];

    this.garbage = [];

    this.collisionMaxDistanceSq = undefined;
}

Engine.Collision.prototype.addObject = function(object)
{
    if (object instanceof Engine.Object !== true) {
        throw new TypeError('Collidable wrong type');
    }
    this.objects.push(object);
    this.collisionIndex.push([]);
    this.positionCache.push(new THREE.Vector3().set());
}

Engine.Collision.prototype.garbageCollect = function()
{
    var object;
    var index;
    while (object = this.garbage.pop()) {
        while ((index = this.objects.indexOf(object)) !== -1) {
            this.objects.splice(index, 1);
            this.collisionIndex.splice(index, 1);
            this.positionCache.splice(index, 1);
       }
    }
}

Engine.Collision.prototype.removeObject = function(object)
{
    this.garbage.push(object);
}

Engine.Collision.prototype.objectNeedsRecheck = function(index)
{
    var o = this.objects[index];
    var p = this.positionCache[index];
    if (p.equals(o.position)) {
        return false;
    }
    p.copy(o.position);
    return true;
}

Engine.Collision.prototype.detect = function()
{
    this.garbageCollect();

    for (var i = 0, l = this.objects.length; i !== l; ++i) {
        if (this.objects[i].collidable && this.objectNeedsRecheck(i)) {
            for (var j = 0; j !== l; ++j) {
                if (i !== j && this.objects[j].collidable) {
                    this.objectIndexesCollide(i, j);
                }
            }
        }
    }
}

Engine.Collision.prototype.objectIndexesCollide = function(i, j)
{
    var o1 = this.objects[i],
        o2 = this.objects[j];

    if (this.objectsCollide(o1, o2)) {
        if (this.collisionIndex[i].indexOf(o2) < 0) {
            this.collisionIndex[i].push(o2);
        }
        return true;
    }
    else {
        var ix = this.collisionIndex[i].indexOf(o2);
        if (ix !== -1) {
            o1.uncollides(o2);
            o2.uncollides(o1);
            this.collisionIndex[i].splice(ix, 1);
        }
        return false;
    }
}

Engine.Collision.prototype.objectsCollide = function(o1, o2)
{
    if (o1.position.distanceToSquared(o2.position) > this.collisionMaxDistanceSq) {
        return false;
    }

    for (var i = 0, l = o1.collision.length; i !== l; ++i) {
        var z1 = o1.collision[i];
        for (var j = 0, m = o2.collision.length; j !== m; ++j) {
            var z2 = o2.collision[j];
            if (this.zonesCollide(o1, z1, o2, z2)) {
                o1.collides.call(o1, o2, z1, z2);
                o2.collides.call(o2, o1, z2, z1);
                return true;
            }
        }
    }
    return false;
}

Engine.Collision.prototype.setCollisionRadius = function(units)
{
    this.collisionMaxDistanceSq = units * units;
}

Engine.Collision.prototype.zonesCollide = function(object1, zone1, object2, zone2)
{
    var pos1 = object1.model.position.clone().add(zone1.position);
    var pos2 = object2.model.position.clone().add(zone2.position);

    var rect1 = Engine.Math.Geometry.convertPlaneToRectangle(zone1.geometry);
    var rect2 = Engine.Math.Geometry.convertPlaneToRectangle(zone2.geometry);

    return Engine.Math.Geometry.rectanglesIntersect(
        pos1.x, pos1.y, rect1.w, rect1.h,
        pos2.x, pos2.y, rect2.w, rect2.h);
}

Engine.Collision.BoundingBox = function(model, zone)
{
    var rect = Engine.Math.Geometry.convertPlaneToRectangle(zone.geometry);

    this.model = model;
    this.zone = zone;

    this.height = rect.h;
    this.width = rect.w;

    this._h = this.height / 2;
    this._w = this.width / 2;
}

Object.defineProperties(Engine.Collision.BoundingBox.prototype, {
    x: {
        get: function() {
            return this.model.position.x + this.zone.position.x;
        },
        set: function(v) {
            this.model.position.x = v - this.zone.position.x;
        },
    },
    y: {
        get: function() {
            return this.model.position.y + this.zone.position.y;
        },
        set: function(v) {
            this.model.position.y = v - this.zone.position.y;
        },
    },
    left: {
        get: function() {
            return this.x - this._w;
        },
        set: function(v) {
            this.x = v + this._w;
        },
    },
    right: {
        get: function() {
            return this.x + this._w;
        },
        set: function(v) {
            this.x = v - this._w;
        },
    },
    top: {
        get: function() {
            return this.y + this._h;
        },
        set: function(v) {
            this.y = v - this._h;
        },
    },
    bottom: {
        get: function() {
            return this.y - this._h;
        },
        set: function(v) {
            this.y = v + this._h;
        },
    },
});
