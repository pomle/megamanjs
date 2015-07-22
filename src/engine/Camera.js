Engine.Camera = function(camera)
{
    this.camera = camera;
    this.desiredPosition = undefined;
    this.followObject = undefined;
    this.followOffset = new THREE.Vector2(0, 25);
    this.followLookAhead = new THREE.Vector2(.5, .2);
    this.obeyPaths = true;
    this.paths = [];
    this.smoothing = 20;
    this.velocity = new THREE.Vector3(0, 0, 0);
}

Engine.Camera.prototype.addPath = function(x1, y1, x2, y2, z)
{
    this.paths.push([
        new THREE.Vector2(x1, y1),
        new THREE.Vector2(x2, y2),
        z || this.camera.position.z,
    ]);
}

Engine.Camera.prototype.alignToPath = function(pos)
{
    if (this.paths.length == 0) {
        return false;
    }

    var distances = [],
        x = pos.x,
        y = pos.y;

    for (var i = 0, l = this.paths.length; i < l; i++) {
        var path = this.paths[i];
        distances[i] = Engine.Math.close(x, path[0].x, path[1].x)
                     + Engine.Math.close(y, path[0].y, path[1].y);
    }

    var minIndex = 0,
        min = distances[minIndex];
    for (var l = i, i = 1; i <= l; i++) {
        if (distances[i] < min) {
            minIndex = i;
            min = distances[i];
        }
    }

    pos.x = Engine.Math.clamp(x, this.paths[minIndex][0].x, this.paths[minIndex][1].x);
    pos.y = Engine.Math.clamp(y, this.paths[minIndex][1].y, this.paths[minIndex][0].y);
    pos.z = this.paths[minIndex][2];

    return true;
}

Engine.Camera.prototype.follow = function(object, offset)
{
    this.followObject = object;
    this.desiredPosition = object.position.clone();
    this.desiredPosition.z = this.camera.position.z;
    if (offset) {
        this.followOffset = offset;
    } else {
        this.followOffset = new THREE.Vector2(0, 0);
    }
}

Engine.Camera.prototype.jumpTo = function(vec)
{
    this.camera.position.x = vec.x;
    this.camera.position.y = vec.y;
    this.camera.position.z = vec.z || this.camera.position.z;
}

Engine.Camera.prototype.jumpToPath = function(vec)
{
    this.jumpTo(vec);
    this.alignToPath(this.camera.position);
}

Engine.Camera.prototype.panTo = function(vec)
{
    this.desiredPosition.copy(vec);
}

Engine.Camera.prototype.unfollow = function()
{
    this.followObject = undefined;
    this.desiredPosition = undefined;
}

Engine.Camera.prototype.updateTime = function(timeElapsed)
{
    if (this.followObject) {
        this.desiredPosition.x = this.followObject.position.x + this.followOffset.x;
        this.desiredPosition.y = this.followObject.position.y + this.followOffset.y;
    }

    if (this.desiredPosition) {
        if (this.obeyPaths) {
            this.alignToPath(this.desiredPosition);
        }
        this.velocity = this.desiredPosition.clone().sub(this.camera.position);
        if (this.smoothing > 0) {
            this.velocity.divideScalar(this.smoothing);
        }
    }

    this.camera.position.x += this.velocity.x;
    this.camera.position.y += this.velocity.y;
    this.camera.position.z += this.velocity.z;
}
