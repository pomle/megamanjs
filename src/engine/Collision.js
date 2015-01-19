Engine.Collision = function()
{
    this.objects = [];
    this.positionCache = [];
}

Engine.Collision.prototype.addObject = function(object)
{
    if (object instanceof Engine.assets.Object !== true) {
        throw new Error('Collidable wrong type');
    }
    this.objects.push(object);
    this.positionCache.push(undefined);
}

Engine.Collision.prototype.removeObject = function(object)
{
    var i;
    for (i in this.objects) {
        if (this.objects[i] === object) {
            this.objects.splice(i, 1);
            this.positionCache.splice(i, 1);
        }
    }
}

Engine.Collision.prototype.detect = function()
{
    var i, j, o1, o2;
    for (i in this.objects) {
        o1 = this.objects[i];
        // If object's position haven't changed.
        if (this.positionCache[i] && this.positionCache[i].equals(o1.model.position)) {
            continue;
        }
        this.positionCache[i] = o1.model.position.clone();

        for (j in this.objects) {
            // Don't check with self.
            if (j == i) {
                continue;
            }
            o2 = this.objects[j];
            this.objectsCollide(o1, o2);
        }
    }
}

Engine.Collision.prototype.objectsCollide = function(o1, o2)
{
    var i, j, z1, z2;
    for (i in o1.collision) {
        z1 = o1.collision[i];
        for (j in o2.collision) {
            z2 = o2.collision[j];
            if (this.zonesCollide(o1, z1, o2, z2)) {
                o1.collides.call(o1, o2, z1, z2);
                o2.collides.call(o2, o1, z2, z1);
                return true;
            }
        }
    }
    return false;
}

Engine.Collision.prototype.zonesCollide = function(object1, zone1, object2, zone2)
{
    var pos = [
        object1.model.position.clone().add(zone1.position),
        object2.model.position.clone().add(zone2.position)
    ];
    var geo = [
        zone1.geometry,
        zone2.geometry
    ];
    if (geo[0] instanceof THREE.CircleGeometry && geo[1] instanceof THREE.CircleGeometry) {
        return this.circlesIntersect(geo[0].boundingSphere.radius, geo[1].boundingSphere.radius,
            pos[0].x, pos[1].x, pos[0].y, pos[1].y);
    }
    else if (geo[0] instanceof THREE.PlaneGeometry && geo[1] instanceof THREE.PlaneGeometry) {
        return false;
    }
    else {
        if (geo[0] instanceof THREE.PlaneGeometry) {
            geo = [geo[1], geo[0]];
            pos = [pos[1], pos[0]];
        }
        return this.circleInRectangle(geo[0].boundingSphere.radius, pos[0].x, pos[0].y,
            pos[1].x, pos[1].y,
            Math.abs(geo[1].vertices[0].x - geo[1].vertices[1].x),
            Math.abs(geo[1].vertices[1].y - geo[1].vertices[3].y));
    }
    return false;
}

Engine.Collision.prototype.circlesIntersect = function(r1, r2, x1, x2, y1, y2)
{
    var dx = x2 - x1;
    var dy = y2 - y1;
    var radii = r1 + r2;
    if ((dx * dx + dy * dy) < radii * radii) {
        return true;
    }
}

Engine.Collision.prototype.circleInRectangle = function(r, x, y, a, b, w, h)
{
    var circle = {
        x: Math.abs(x - a),
        y: Math.abs(y - b),
    }

    if (circle.x > (w/2 + r) || circle.y > (h/2 + r)) {
        return false;
    }

    if (circle.x <= (w/2) || circle.y <= (h/2)) {
        return true;
    }

    cornerDistanceSq = Math.pow(circle.x - w/2, 2) +
                        Math.pow(circle.y - h/2, 2);

    if (cornerDistanceSq <= Math.pow(r, 2)) {
        return true;
    }

    return false;
}
