var Engine = function(renderer)
{
    var self = this;
    self.renderer = renderer;
    self.scene = undefined;
    self.timer = undefined;

    self.run = function()
    {
        if (self.scene) {
            self.timer.callbacks.push(function(t) {
                self.scene.updateTime(t);
                self.scene.camera.updateTime(t);
                self.render();
            });
        }

        self.timer.start();
    }

    self.pause = function()
    {
        self.timer.stop();
        self.timer.callbacks = [];
    }

    self.render = function()
    {
        renderer.render(self.scene.scene, self.scene.camera.camera);
    }
}

Engine.Util = {
    createSprite: function(location, w, h)
    {
        var texture = Engine.Util.getTexture('sprites/' + location);
        var geometry = new THREE.PlaneBufferGeometry(w, h);
        var material = new THREE.MeshLambertMaterial({
            map: texture,
            transparent: true
        });
        var model = new THREE.Mesh(geometry, material);
        return model;
    },

    getTexture: function(url, callback)
    {
        var texture = THREE.ImageUtils.loadTexture(url, null, callback);
        //texture.magFilter = THREE.NearestFilter;
        return texture;
    }
}

Engine.assets = {};
