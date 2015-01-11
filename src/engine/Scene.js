Engine.Scene = function()
{
    this.camera = new Engine.Camera(new THREE.PerspectiveCamera(75, 600 / 400, 0.1, 1000));
    this.camera.camera.position.z = 100;
    this.scene = new THREE.Scene();
    var ambientLight = new THREE.AmbientLight(0xffffff);
    this.scene.add(ambientLight);
    this.objects = [];
    this.timelines = [];
}

Engine.Scene.prototype.addObject = function(object)
{
    if (object instanceof Engine.assets.Object !== true) {
        throw new Error('Invalid object');
    }
    this.objects.push(object);
    this.scene.add(object.model);
    console.log('Added object', object.uuid, object);
}

Engine.Scene.prototype.addTimeline = function(timeline)
{
    if (timeline instanceof Engine.Timeline !== true) {
        throw new Error('Invalid timeline');
    }
    this.timelines.push(timeline);
}

Engine.Scene.prototype.removeObject = function(object)
{
    if (object instanceof Engine.assets.Object !== true) {
        throw new Error('Invalid object');
    }
    var i, o, list = [];
    for (i in this.objects) {
        o = this.objects[i];
        if (o.uuid === object.uuid) {
            this.objects.splice(i, 1);
            this.scene.remove(o.model);
            list.push(o);
        }
    }
    if (list.length == 0) {
        throw new Error('Object not found ' + object.uuid);
    }
}

Engine.Scene.prototype.updateTime = function(timeElapsed)
{
    var i, o;
    for (i in this.objects) {
        o = this.objects[i];
        o.timeShift(timeElapsed);
    }
    for (i in this.timelines) {
        o = this.timelines[i];
        o.timeShift(timeElapsed);
    }
}

Engine.scenes = {};
