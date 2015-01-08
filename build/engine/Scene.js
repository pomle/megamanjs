Engine.Scene = function()
{
    var self = this;
    self.camera = new Engine.Camera(new THREE.PerspectiveCamera(75, 600 / 400, 0.1, 1000));
    self.camera.camera.position.z = 100;
    self.scene = new THREE.Scene();
    var ambientLight = new THREE.AmbientLight(0xffffff);
    self.scene.add(ambientLight);
    self.objects = [];

    self.addObject = function(o)
    {
        self.objects.push(o);
        self.scene.add(o.model);
    }

    self.updateTime = function(timeElapsed)
    {
        var i, o;
        for (i in self.objects) {
            o = self.objects[i];
            if (o.wantsRemove) {
                self.scene.remove(o.model);
                self.objects.splice(i,1);
            }
            else {
                self.objects[i].timeShift(timeElapsed);
            }
        }
    }
}

Engine.scenes = {};
