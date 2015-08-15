Game.Debug = function(game)
{
    this.game = game;
    this.engine = this.game.engine;

    this.consoleElement = undefined;
    this.consoleTimer = undefined;

    this.cameraPaths = new Set();
    this.collisionZonesVisible = false;

    this.units = {
        'u': ['', 1, 10],
        'm': ['m', .055, 5],
    }

    this.unit = 'u';
}


Game.Debug.prototype.printVector = function(vec)
{
    var unit = this.units[this.unit],
        u = unit[0],
        s = unit[1],
        p = unit[2];
    return [
        "X: " + (vec.x === undefined ? NaN : vec.x).toFixed(p) * s + u,
        "Y: " + (vec.y === undefined ? NaN : vec.y).toFixed(p) * s + u,
        "Z: " + (vec.z === undefined ? NaN : vec.z).toFixed(p) * s + u,
    ].join(', ');
}

Game.Debug.prototype.updateConsole = function()
{
    var strings = [];

    if (this.game.scene) {
        strings.push("Camera Position: " + this.printVector(game.scene.camera.camera.position));
        for (var object of game.scene.world.objects) {
            var p = object.position;
            if (p.x === undefined || p.y === undefined || p.z === undefined) {
                console.warn("%s has undefined position %s", object.uuid, this.printVector(p));
            }
        }
    }
    if (this.game.player) {
        strings.push("Player Velocity: " + this.printVector(game.player.character.velocity));
        strings.push("Player Acceleration: " + this.printVector(game.player.character.physics.acceleration));
        strings.push("Player Position: " + this.printVector(game.player.character.position));
    }

    this.consoleElement.html(strings.join("\n"));
}

Game.Debug.prototype.toggleConsole = function()
{
    if (this.consoleElement) {
        this.consoleElement.remove();
        this.consoleElement = undefined;
        clearInterval(this.consoleTimer);
    }
    else {
        this.consoleElement = $('<div style="background-color: rgba(0,0,0,.8); font-family: monospace; margin: 2px; position: absolute; left: 0; top: 0; text-align: left; white-space: pre; z-index: 100;"></div>');
        $('body').append(this.consoleElement);
        this.consoleTimer = setInterval(this.updateConsole.bind(this), 1000);
        this.updateConsole();
    }
}

Game.Debug.prototype.toggleCollisionZones = function()
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

Game.Debug.prototype.toggleCameraPaths = function()
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
