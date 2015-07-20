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

Engine.Camera.prototype.addPath = function(x1, y1, x2, y2)
{
    this.paths.push([
        new THREE.Vector2(x1, y1),
        new THREE.Vector2(x2, y2),
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
        distances[i] = howMuchInsideAmI(x, path[0].x, path[1].x)
                     + howMuchInsideAmI(y, path[0].y, path[1].y);
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

    return true;
}

Engine.Camera.prototype.follow = function(object, offset)
{
    this.followObject = object;
    this.desiredPosition = new THREE.Vector2();
    if (offset) {
        this.followOffset = offset;
    } else {
        this.followOffset = new THREE.Vector2(0, 0);
    }
}

Engine.Camera.prototype.jumpTo = function(pos)
{
    this.camera.position.x = pos.x;
    this.camera.position.y = pos.y;
}

Engine.Camera.prototype.jumpToPath = function(pos)
{
    this.jumpTo(pos);
    this.alignToPath(this.camera.position);
}

Engine.Camera.prototype.panTo = function(pos)
{
    this.desiredPosition = pos.clone();
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
}

function howMuchInsideAmI(x, x1, x2) {
    if (x1 > x2) {
        x1 = x1 + x2;
        x2 = x1 - x2;
        x1 = x1 - x2;
    }
    var val = Math.abs(x1 - x) + Math.abs(x - x2);
    val -= Math.abs(x2 - x1);
    if (val == 0) {
        val -= Math.min(x2 - x, x - x1);
    }
    return val;
}
