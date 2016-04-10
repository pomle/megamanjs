Engine.Camera = function(camera)
{
    this.camera = camera;
    this.desiredPosition = undefined;
    this.followObject = undefined;
    this.followOffset = new THREE.Vector2(0, 0);
    this.obeyPaths = true;
    this.paths = [];
    this.pathIndex = -1;
    this.position = this.camera.position;
    this.smoothing = 20;
    this.velocity = new THREE.Vector3(0, 0, 0);
}

Engine.Camera.prototype.addPath = function(path)
{
    if (path instanceof Engine.Camera.Path === false) {
        throw new TypeError("Invalid camera path");
    }
    this.paths.push(path);
}

Engine.Camera.prototype.alignToPath = function(pos)
{
    if (this.paths.length == 0) {
        return false;
    }

    this.findPath(pos);

    if (this.pathIndex !== -1) {
        this.paths[this.pathIndex].constrain(pos);
    }

    return true;
}

Engine.Camera.prototype.findPath = function(pos)
{
    /* If we're inside current path, don't look for a new one. */
    if (this.pathIndex !== -1 && this.paths[this.pathIndex].inWindow(pos)) {
        return;
    }

    for (var i = 0, l = this.paths.length; i !== l; ++i) {
        var path = this.paths[i];
        if (path.inWindow(pos)) {
            this.pathIndex = i;
            return;
        }
    }

    return;
}

Engine.Camera.prototype.follow = function(object, offset)
{
    this.followObject = object;
    this.desiredPosition = object.position.clone();
    this.desiredPosition.z = this.camera.position.z;
    if (offset === undefined) {
        this.followOffset.set(0, 0);
    } else {
        this.followOffset.copy(offset);
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
    this.desiredPosition = vec.clone();
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
        this.velocity.copy(this.desiredPosition).sub(this.camera.position);
        if (this.smoothing > 0) {
            this.velocity.divideScalar(this.smoothing);
        }
    }

    this.camera.position.x += this.velocity.x;
    this.camera.position.y += this.velocity.y;
    this.camera.position.z += this.velocity.z;
};

Engine.Camera.Path = function()
{
    this.constraint = [
        new THREE.Vector3(),
        new THREE.Vector3(),
    ];
    this.window = [
        new THREE.Vector2(),
        new THREE.Vector2(),
    ];
};

Engine.Camera.Path.prototype.constrain = function(vec)
{
    vec.clamp(this.constraint[0], this.constraint[1]);
};

Engine.Camera.Path.prototype.inWindow = function(vec)
{
    return vec.x >= this.window[0].x
        && vec.x <= this.window[1].x
        && vec.y >= this.window[0].y
        && vec.y <= this.window[1].y;
};

Engine.Camera.Path.prototype.setConstraint = function(x1, y1, x2, y2) {
    this.constraint[0].x = x1;
    this.constraint[0].y = y1;
    this.constraint[1].x = x2;
    this.constraint[1].y = y2;
}

Engine.Camera.Path.prototype.setWindow = function(x1, y1, x2, y2) {
    this.window[0].x = x1;
    this.window[0].y = y1;
    this.window[1].x = x2;
    this.window[1].y = y2;
}
