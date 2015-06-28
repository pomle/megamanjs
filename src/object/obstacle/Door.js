Engine.assets.obstacles.Door = function()
{
    Engine.assets.Solid.call(this);
    this.doorSpeed = 1;
    this.doorPosition = undefined;
    this.enabled = true;
    this.oneWay = true;
    this.toggleDelay = .5;
    this.traverseStep = -1;
    this.traverseSpeed = .5;

    this.traverseSteps = [
        function start() {
            this.doorClosePosition = this.position.clone();
            this.doorOpenPosition = this.doorClosePosition.clone();
            this.doorOpenPosition.y += 64;
            return true;
        },
        function open(dt) {
            return Engine.Animation.vectorTraverse(this.position, this.doorOpenPosition, this.doorSpeed) == 0;
        },
        function traverse(dt) {
            return Engine.Animation.vectorTraverse(this.traverseObject.position, this.traverseDestination, this.traverseSpeed) == 0;
        },
        function close(dt) {
            if (Engine.Animation.vectorTraverse(this.position, this.doorClosePosition, this.doorSpeed) == 0) {
                this.release();
                return true;
            }
        }
    ];
}

Engine.assets.obstacles.Door.prototype = Object.create(Engine.assets.Solid.prototype);
Engine.assets.obstacles.Door.constructor = Engine.assets.obstacles.Door;

Engine.assets.obstacles.Door.prototype.detain = function(object, destination)
{
    this.traverseObject = object;
    this.traverseObject.collidable = false;
    this.traverseObject.physics = false;
    this.traverseDestination = destination;
    this.traverseStep = 0;
}

Engine.assets.obstacles.Door.prototype.release = function()
{
    this.traverseObject.collidable = true;
    this.traverseObject.physics = true;
    this.traverseObject = undefined;
}

Engine.assets.obstacles.Door.prototype.collides = function(withObject, ourZone, theirZone)
{
    if (this.enabled && withObject.isPlayer && this.traverseObject === undefined) {
        // Ignore collisions with currently handled object.
        if (withObject === this.traverseObject) {
            return;
        }
        var our = new Engine.Collision.BoundingBox(this.model, ourZone);
        var their = new Engine.Collision.BoundingBox(withObject.model, theirZone);
        var traverseWidth = our.w + their.w;
        var dest = new THREE.Vector2(withObject.position.x + (this.position.x > withObject.position.x ? traverseWidth : -traverseWidth),
                                     withObject.position.y);
        if (this.oneWay) {
            this.enabled = false;
        }
        this.detain(withObject, dest);
    }
    else {
        Engine.assets.Solid.prototype.collides.call(this, withObject, ourZone, theirZone);
    }
}

Engine.assets.obstacles.Door.prototype.uncollides = function(withObject, ourZone, theirZone)
{
}

Engine.assets.obstacles.Door.prototype.timeShift = function(dt)
{
    if (this.traverseStep > -1) {
        if (!this.traverseSteps[this.traverseStep]) {
            this.traverseStep = -1;
        }
        else if (this.traverseSteps[this.traverseStep].call(this, dt)) {
            this.traverseStep++;
        }
    }
}
