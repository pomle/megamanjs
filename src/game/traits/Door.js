Game.traits.Door = function()
{
    Engine.Trait.call(this);
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
                this._release();
                return true;
            }
        }
    ];
}

Engine.Util.extend(Game.traits.Door, Engine.Trait);
Game.traits.Door.prototype.NAME = 'door';

Game.traits.Door.prototype.__collides = function(withObject, ourZone, theirZone)
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
        this._detain(withObject, dest);
    }
    else {
        /*
        Game.objects.Solid.prototype.collides.call(this, withObject, ourZone, theirZone);
        */
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
    this.traverseObject.physics.off();
    this.traverseDestination = destination;
    this.traverseStep = 0;
}

Game.traits.Door.prototype._release = function()
{
    this.traverseObject.collidable = true;
    this.traverseObject.physics.on();
    this.traverseObject = undefined;
}
