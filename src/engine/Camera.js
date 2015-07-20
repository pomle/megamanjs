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
    this.velocity = new THREE.Vector2(0, 0);
}

Engine.Camera.prototype.addPath = function(x1, x2, y1, y2)
{
    this.paths.push([
        new THREE.Vector2(x1, x2),
        new THREE.Vector2(y1, y2),
    ]);
}

Engine.Camera.prototype.follow = function(object, offset)
{
    this.followObject = object;
    if (offset) {
        this.followOffset = offset;
    } else {
        this.followOffset = new THREE.Vector2(0, 0);
    }
}

Engine.Camera.prototype.jumpTo = function(pos)
{
    this.unfollow();
    this.desiredPosition = undefined;
    this.camera.position.x = pos.x;
    this.camera.position.y = pos.y;
}

Engine.Camera.prototype.panTo = function(pos)
{
    this.desiredPosition = pos.clone();
}

Engine.Camera.prototype.unfollow = function()
{
    this.desiredPosition = undefined;
    this.followObject = undefined;
}

Engine.Camera.prototype.updateTime = function(timeElapsed)
{
    if (this.followObject) {
        if (!this.desiredPosition) {
            this.desiredPosition = new THREE.Vector2();
        }

        this.desiredPosition.x = this.followObject.position.x + this.followOffset.x;
        this.desiredPosition.y = this.followObject.position.y + this.followOffset.y;
    }

    if (this.desiredPosition) {
        if (this.obeyPaths && this.paths.length) {
            var distances = [];
            var x = this.desiredPosition.x;
            var y = this.desiredPosition.y;
            for (var i in this.paths) {
                var path = this.paths[i];
                distances[i] = Math.min(Math.abs(x - path[0].x), Math.abs(x - path[1].x))
                             + Math.min(Math.abs(y - path[0].y), Math.abs(y - path[1].y));
            }
            var minIndex = 0, min = distances[minIndex];
            for (var i = 1, l = distances.length; i < l; i++) {
                if (distances[i] < min) {
                    minIndex = i;
                    min = distances[i];
                }
            }
            var path = this.paths[minIndex];
            this.desiredPosition.x = Engine.Math.clamp(this.desiredPosition.x, path[0].x, path[1].x);
            this.desiredPosition.y = Engine.Math.clamp(this.desiredPosition.y, path[0].y, path[1].y);
        }

        this.velocity = this.desiredPosition.clone().sub(this.camera.position);
        if (this.smoothing > 0) {
            this.velocity.divideScalar(this.smoothing);
        }
    }

    this.camera.position.x += this.velocity.x;
    this.camera.position.y += this.velocity.y;
}
