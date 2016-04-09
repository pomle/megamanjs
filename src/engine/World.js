Engine.World = function()
{
    this.ambientLight = new THREE.AmbientLight(0xffffff);

    this.camera = new Engine.Camera(new THREE.PerspectiveCamera(75, 600 / 400, 0.1, 1000));

    this.collision = new Engine.Collision();

    this.events = new Engine.Events();

    this.atmosphericDensity = .1;
    this.atmosphericViscosity = .1;
    this.gravityForce = new THREE.Vector2(0, 9.81);
    this.windForce = new THREE.Vector2(0, 0);

    this.objects = [];

    this.scene = new THREE.Scene();
    this.scene.add(this.ambientLight);

    this.timeStretch = 1;
    this.timeTotal = 0;
}

Engine.World.prototype.EVENT_UPDATE = 'update';

Engine.World.prototype.addObject = function(object)
{
    if (object instanceof Engine.Object === false) {
        throw new TypeError('Invalid object');
    }
    if (this.objects.indexOf(object) !== -1) {
        return;
    }

    this.objects.push(object);
    this.collision.addObject(object);
    if (object.model) {
        this.scene.add(object.model);
    }
    object.setWorld(this);
}

Engine.World.prototype.getObject = function(name)
{
    for (var i = 0, l = this.objects.length; i !== l; ++i) {
        var object = this.objects[i];
        if (object.name === name) {
            return object;
        }
    }
    return false;
}

Engine.World.prototype.removeObject = function(object)
{
    if (object instanceof Engine.Object === false) {
        throw new TypeError('Invalid object');
    }
    var index = this.objects.indexOf(object);
    if (index !== -1) {
        object.unsetWorld();
        this.objects[index] = undefined;
        this.collision.removeObject(object);
        if (object.model) {
            this.scene.remove(object.model);
        }
    }
}

Engine.World.prototype.updateTime = function(deltaTime)
{
    deltaTime *= this.timeStretch;
    this.timeTotal += deltaTime;

    for (var object, objects = this.objects, i = 0, l = objects.length; i !== l; ++i) {
        object = objects[i];
        if (object === undefined) {
            objects.splice(i, 1);
            --i;
            --l;
        }
        else {
            object.timeShift(deltaTime * object.timeStretch, this.timeTotal);
        }
    }

    this.collision.detect();

    this.events.trigger(this.EVENT_UPDATE, [deltaTime, this.timeTotal]);
}
