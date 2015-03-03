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
    //console.log('Added object', object.uuid, object);
}

Engine.Scene.prototype.addTimeline = function(timeline)
{
    if (timeline instanceof Engine.Timeline !== true) {
        throw new Error('Invalid timeline');
    }
    this.timelines.push(timeline);
}

Engine.Scene.prototype.garbageCollectObjects = function()
{
    var i, l = this.objects.length;
    for (i = 0; i < l; i++) {
        if (this.objects[i] === undefined) {
            this.objects.splice(i, 1);
            l--;
            i--;
        }
    }
}

Engine.Scene.prototype.removeObject = function(object)
{
    if (object instanceof Engine.assets.Object !== true) {
        throw new Error('Invalid object');
    }

    var i = this.objects.indexOf(object);
    if (i > -1) {
        this.scene.remove(this.objects[i].model);
        this.objects[i] = undefined;
    }
}

Engine.Scene.prototype.updateTime = function(td)
{
    var i, l;

    l = this.objects.length;
    for (i = 0; i < l; i++) {
        this.objects[i].timeShift(td * this.objects[i].timeStretch);
    }
    /* When objects get timeshifted they might decide to
    remove themselves for various reasons. To ensure we're
    not dirty before we return the objects, make a GC run. */
    this.garbageCollectObjects();

    l = this.timelines.length;
    for (i = 0; i < l; i++) {
        this.timelines[i].timeShift(td);
    }
}

Engine.scenes = {};
