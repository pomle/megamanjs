Engine.Scene = function()
{
    var self = this;
    self.camera = new Engine.Camera(new THREE.PerspectiveCamera(75, 600 / 400, 0.1, 1000));
    self.camera.camera.position.z = 100;
    self.scene = new THREE.Scene();
    self.objects = [];

    self.addObject = function(o)
    {
        self.objects.push(o);
        self.scene.add(o.model);
    }

    self.updateTime = function(timeElapsed)
    {
        var i;
        for (i in self.objects) {
            self.objects[i].timeShift(timeElapsed);
        }
    }
}

Engine.scenes = {};
