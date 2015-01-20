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
            /*if (o2 instanceof Engine.assets.Solid)o1.model.position.distanceTo(o2.model.position) > 200) {
                continue;
            }*/
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
            console.log('Collision check');
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

    var lookAheadX = (object1.speed.x / 40);
    var lookAheadY = (object1.speed.y / 40);
    //console.log('Look-a-head: x: %f, y: %f', lookAheadX, lookAheadY);
    pos[0].x += lookAheadX;
    pos[0].y += lookAheadY;

    var geo = [
        zone1.geometry,
        zone2.geometry
    ];
    if (geo[0] instanceof THREE.CircleGeometry && geo[1] instanceof THREE.CircleGeometry) {
        return this.circlesIntersect(geo[0].boundingSphere.radius, geo[1].boundingSphere.radius,
            pos[0].x, pos[1].x, pos[0].y, pos[1].y);
    }
    else if (geo[0] instanceof THREE.PlaneGeometry && geo[1] instanceof THREE.PlaneGeometry) {
        var rect = [
            this.convertPlaneToRectangle(geo[0]),
            this.convertPlaneToRectangle(geo[1]),
        ];
        //console.log(pos);
        return this.rectanglesIntersect(
            pos[0].x, pos[0].y, rect[0].w, rect[0].h,
            pos[1].x, pos[1].y, rect[1].w, rect[1].h);
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

    if (circle.x > (w / 2 + r) || circle.y > (h / 2 + r)) {
        return false;
    }

    if (circle.x <= (w / 2) || circle.y <= (h / 2)) {
        return true;
    }

    var cornerDistanceSq = Math.pow(circle.x - w / 2, 2) +
                           Math.pow(circle.y - h / 2, 2);

    if (cornerDistanceSq <= Math.pow(r, 2)) {
        return true;
    }

    return false;
}

Engine.Collision.prototype.rectanglesIntersect = function(x1, y1, w1, h1, x2, y2, w2, h2)
{
    w1 /= 2;
    w2 /= 2;
    h1 /= 2;
    h2 /= 2;
    if (x1 + w1 > x2 - w2 && x1 - w1 < x2 + w2 &&
        y1 + h1 > y2 - h2 && y1 - h1 < y2 + h2) {
        return true;
    }
    //console.log(x1, y1, w1, h1, x2, y2, w2, h2);
    return false;
}

Engine.Collision.prototype.convertPlaneToRectangle = function(geometry)
{
    return {
        'w': Math.abs(geometry.vertices[0].x - geometry.vertices[1].x),
        'h': Math.abs(geometry.vertices[1].y - geometry.vertices[3].y),
    }
}
