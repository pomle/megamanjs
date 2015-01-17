Engine.Collision = function()
{
    this.objects = [];
    this.positionCache = [];
}

Engine.Collision.prototype.addObject = function(object)
{
    this.objects.push(object);
    this.positionCache.push(undefined);
}

Engine.Collision.prototype.removeObject = function(object)
{
    var i;
    for (i in this.objects) {
        if (this.objects[i].uuid == object.uuid) {
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
            if (j == i) {
                continue;
            }
            o2 = this.objects[j];
            this.findZones(o1, o2);
        }
    }
}

Engine.Collision.prototype.findZones = function(o1, o2)
{
    var i, j, z1, z2, dx, dy, distance
    for (i in o1.collision) {
        z1 = o1.collision[i];
        for (j in o2.collision) {
            z2 = o2.collision[j];
            dx = (z1.x + o1.model.position.x + z1.radius) - (z2.x + o2.model.position.x + z2.radius);
            dy = (z1.y + o1.model.position.y + z1.radius) - (z2.y + o2.model.position.y + z2.radius);
            distance = Math.sqrt(dx * dx + dy * dy);
            if (distance < z1.radius + z2.radius) {
                o1.collides.call(o1, o2, z1, z2);
                o2.collides.call(o2, o1, z2, z1);
                return;
            }
        }
    }
}
