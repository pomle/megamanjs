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
            var distances = {x:[], y:[]};
            var x = this.desiredPosition.x;
            var y = this.desiredPosition.y;
            for (var i in this.paths) {
                var path = this.paths[i];
                distances.x[i] = howMuchInsideAmI(x, path[0].x, path[1].x);
                distances.y[i] = howMuchInsideAmI(y, path[0].y, path[1].y);
                distances.x[i] += distances.y[i];
                distances.y[i] = distances.x[i];
            }
            var xMinIndex = 0,
                xMin = distances.x[xMinIndex],
                yMinIndex = 0,
                yMin = distances.y[yMinIndex];
            for (var l = i, i = 1; i <= l; i++) {
                if (distances.x[i] < xMin) {
                    xMinIndex = i;
                    xMin = distances.x[i];
                }
                if (distances.y[i] < yMin) {
                    yMinIndex = i;
                    yMin = distances.x[i];
                }
            }
            this.desiredPosition.x = Engine.Math.clamp(this.desiredPosition.x, this.paths[xMinIndex][0].x, this.paths[xMinIndex][1].x);
            this.desiredPosition.y = Engine.Math.clamp(this.desiredPosition.y, this.paths[yMinIndex][1].y, this.paths[yMinIndex][0].y);
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
