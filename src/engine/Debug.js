Engine.Debug = function(engine)
{
    this.engine = engine;

    this.cameraPaths = new Set();
    this.collisionZonesVisible = false;
}

Engine.Debug.prototype.toggleCollisionZones = function()
{
    this.collisionZonesVisible = !this.collisionZonesVisible;
    for (var object of this.engine.world.objects) {
        for (var i in object.collision) {
            var zone = object.collision[i];
            if (this.collisionZonesVisible) {
                zone.position.z = .1;
                object.model.add(zone);
            }
            else {
                zone.position.z = -.1;
                object.model.remove(zone);
            }
        }
    }
}

Engine.Debug.prototype.toggleCameraPaths = function()
{
    if (this.cameraPaths.size) {
        for (var model of this.cameraPaths) {
            this.engine.world.scene.remove(model);
            this.cameraPaths.delete(model);
        }
    }
    else {
        var minThickness = 1;
        var paths = this.engine.world.camera.paths;
        var windowMaterial = new THREE.MeshBasicMaterial({color: 0x00ff00, side: THREE.DoubleSide, wireframe: true});
        var constraintMaterial = new THREE.MeshBasicMaterial({color: 0x00ffff, side: THREE.DoubleSide, wireframe: true});
        for (var i = 0, l = paths.length; i < l; ++i) {
            var path = paths[i];

            var w = Math.max(minThickness, Math.abs(path.window[0].x - path.window[1].x));
            var h = Math.max(minThickness, Math.abs(path.window[0].y - path.window[1].y));
            var geometry = new THREE.PlaneGeometry(w, h);
            var plane = new THREE.Mesh(geometry, windowMaterial);
            plane.position.x = path.window[0].x + w/2;
            plane.position.y = path.window[0].y + h/2;
            plane.position.z = .2;
            this.cameraPaths.add(plane);
            this.engine.world.scene.add(plane);

            var w = Math.max(minThickness, Math.abs(path.constraint[0].x - path.constraint[1].x));
            var h = Math.max(minThickness, Math.abs(path.constraint[0].y - path.constraint[1].y));
            var geometry = new THREE.PlaneGeometry(w, h);
            var plane = new THREE.Mesh(geometry, constraintMaterial);
            plane.position.x = path.constraint[0].x + w/2;
            plane.position.y = path.constraint[0].y - h/2;
            plane.position.z = .2;
            this.cameraPaths.add(plane);
            this.engine.world.scene.add(plane);
        }
    }
}
