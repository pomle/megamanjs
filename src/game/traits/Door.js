Game.traits.Door = function()
{
    Game.traits.Solid.call(this);

    this.doorSpeed = 1;
    this.doorPosition = undefined;
    this.enabled = true;
    this.oneWay = true;
    this.toggleDelay = .5;
    this.traverseStep = -1;
    this.traverseSpeed = .5;

    var traverseFunction = Engine.Animation.vectorTraverse;

    this.traverseSteps = [
        function start() {
            this.doorClosePosition = this._host.position.clone();
            this.doorOpenPosition = this.doorClosePosition.clone();
            this.doorOpenPosition.y += 64;
            return true;
        },
        function open(dt) {
            return traverseFunction(this._host.position, this.doorOpenPosition, this.doorSpeed) == 0;
        },
        function traverse(dt) {
            return traverseFunction(this.traverseObject.position, this.traverseDestination, this.traverseSpeed) == 0;
        },
        function close(dt) {
            if (traverseFunction(this._host.position, this.doorClosePosition, this.doorSpeed) == 0) {
                this._release();
                return true;
            }
        }
    ];
}

Engine.Util.extend(Game.traits.Door, Game.traits.Solid);
Game.traits.Door.prototype.NAME = 'door';

Game.traits.Door.prototype.__collides = function(withObject, ourZone, theirZone)
{
    if (this.enabled && withObject.isPlayer && this.traverseObject === undefined) {
        // Ignore collisions with currently handled object.
        if (withObject === this.traverseObject) {
            return;
        }
        var host = this._host;

        var our = new Engine.Collision.BoundingBox(host.model, ourZone);
        var their = new Engine.Collision.BoundingBox(withObject.model, theirZone);
        var traverseWidth = our.width + their.width;
        var dest = new THREE.Vector2(withObject.position.x + (host.position.x > withObject.position.x ? traverseWidth : -traverseWidth),
                                     withObject.position.y);
        if (this.oneWay) {
            this.enabled = false;
        }
        this._detain(withObject, dest);
    }
    else {
        Game.traits.Solid.prototype.__collides.call(this, withObject, ourZone, theirZone);
    }
}

Game.traits.Door.prototype.__timeshift = function(dt)
{
    if (this.traverseStep > -1) {
        if (!this.traverseSteps[this.traverseStep]) {
            this.traverseStep = -1;
        }
        else if (this.traverseSteps[this.traverseStep].call(this, dt)) {
            ++this.traverseStep;
        }
    }
}

Game.traits.Door.prototype._detain = function(object, destination)
{
    this.traverseObject = object;
    this.traverseObject.collidable = false;
    this.traverseObject.physics.zero();
    this.traverseObject.physics.off();
    this.traverseObject.move.off();
    this.traverseDestination = destination;
    this.traverseStep = 0;
}

Game.traits.Door.prototype._release = function()
{
    this.traverseObject.collidable = true;
    this.traverseObject.physics.on();
    this.traverseObject.move.on();
    this.traverseObject = undefined;
}
