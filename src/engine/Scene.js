Engine.Scene = function()
{
    var self = this;
    self.camera = new Engine.Camera(new THREE.PerspectiveCamera(75, 600 / 400, 0.1, 1000));
    self.camera.camera.position.z = 100;
    self.scene = new THREE.Scene();
    var ambientLight = new THREE.AmbientLight(0xffffff);
    self.scene.add(ambientLight);
    self.objects = [];

    self.addObject = function(object)
    {
        if (object instanceof Engine.assets.Object !== true) {
            throw new Error('Invalid object');
        }
        self.objects.push(object);
        self.scene.add(object.model);
        console.log('Added object', object.uuid, object);
    }

    self.removeObject = function(object)
    {
        if (object instanceof Engine.assets.Object !== true) {
            throw new Error('Invalid object');
        }
        var i, o, list = [];
        for (i in self.objects) {
            o = self.objects[i];
            if (o.uuid === object.uuid) {
                self.objects.splice(i, 1);
                self.scene.remove(o.model);
                list.push(o);
            }
        }
        if (list.length == 0) {
            throw new Error('Object not found ' + object.uuid);
        }
    }

    self.updateTime = function(timeElapsed)
    {
        var i, o;
        for (i in self.objects) {
            o = self.objects[i];
            self.objects[i].timeShift(timeElapsed);
        }
    }
}

Engine.scenes = {};
