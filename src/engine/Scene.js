Engine.Scene = function()
{
    var ambientLight = new THREE.AmbientLight(0xffffff);

    this.camera = new Engine.Camera(new THREE.PerspectiveCamera(75, 600 / 400, 0.1, 1000));
    this.camera.camera.position.z = 100;

    this.scene = new THREE.Scene();
    this.scene.add(ambientLight);

    this.objects = [];
    this.timelines = [];

    this.timeStretch = 1;
    this.timeTotal = 0;
}

Engine.Scene.prototype.addObject = function(object)
{
    if (object instanceof Engine.assets.Object === false) {
        throw new Error('Invalid object');
    }
    this.objects.push(object);
    this.scene.add(object.model);
}

Engine.Scene.prototype.addTimeline = function(timeline)
{
    if (timeline instanceof Engine.Timeline !== true) {
        throw new Error('Invalid timeline');
    }
    this.timelines.push(timeline);
}

Engine.Scene.prototype.applyModifiers = function(object, dt)
{

}

Engine.Scene.prototype.removeObject = function(object)
{
    if (object instanceof Engine.assets.Object !== true) {
        throw new Error('Invalid object');
    }
    var i = this.objects.indexOf(object);
    if (i !== -1) {
        this.objects.slice(i, 1);
        this.scene.remove(object.model);
    }
}

Engine.Scene.prototype.updateTime = function(dt)
{
    dt *= this.timeStretch;
    this.timeTotal += dt;
    for (var i = 0, l = this.objects.length; i < l; ++i) {
        var object = this.objects[i];
        this.applyModifiers(object, dt);
        object.timeShift(dt * object.timeStretch, this.timeTotal);
    }

    for (var i = 0, l = this.timelines.length; i < l; i++) {
        this.timelines[i].timeShift(dt);
    }
}


Engine.scenes = {};
