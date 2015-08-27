Game.traits.Door = function()
{
    Game.traits.Solid.call(this);

    this.direction = new THREE.Vector2(0, 0);
    this.duration = .6;
    this.enabled = true;
    this.oneWay = false;
    this.speed = 30;

    var traverseFunction = Engine.Animation.vectorTraverse;

    function accordion(geometry, start, step)
    {
        for (var i = start, l = geometry.vertices.length; i < l; ++i) {
            var v = geometry.vertices[i];
            v.y += step;
        }
        geometry.verticesNeedUpdate = true;
    }


    var step = 0;
    var stepTime = 0;
    var stepLength = undefined;


    this.sequencer = new Engine.Sequencer();
    this.sequencer.addStep(function start() {
        stepLength = this.duration / 4;
        stepTime = 0;
        return true;
    });
    this.sequencer.addStep(function open(dt) {
        stepTime += dt;
        if (stepTime >= stepLength) {
            stepTime = 0;
            accordion(this._host.model.geometry, ++step * 3, 16);
            if (step === 4) {
                return true;
            }
        }
        return false;
    });
    this.sequencer.addStep(function traverse(dt) {
        return traverseFunction(this.traverseObject.position,
                                this.traverseDestination,
                                this.speed * dt) === 0;
    });
    this.sequencer.addStep(function close(dt) {
        stepTime += dt;
        if (stepTime >= stepLength) {
            stepTime = 0;
            accordion(this._host.model.geometry, step-- * 3, -16);
            if (step === 0) {
                this._release();
                return true;
            }
        }
        return false;
    });
}

Engine.Util.extend(Game.traits.Door, Game.traits.Solid);
Game.traits.Door.prototype.NAME = 'door';

Game.traits.Door.prototype.__collides = function(withObject, ourZone, theirZone)
{
    if (this._accept(withObject)) {
        var host = this._host;
        var our = new Engine.Collision.BoundingBox(host.model, ourZone);
        var their = new Engine.Collision.BoundingBox(withObject.model, theirZone);

        var width = (our.width + their.width) / 2;
        var dest = new THREE.Vector2(host.position.x + (host.position.x < withObject.position.x ? -width : width),
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
    if (this.sequencer.step > -1) {
        if (this.traverseObject) {
            this.traverseObject.velocity.copy(this._host.velocity);
        }
        this.sequencer.run(this, [dt]);
    }
}

Game.traits.Door.prototype._accept = function(subject)
{
    if (this.enabled !== true) {
        return false;
    }

    if (!subject.isPlayer) {
        return false;
    }

    if (this.traverseObject !== undefined) {
        return false;
    }

    // Ignore collisions with currently handled object.
    if (subject === this.traverseObject) {
        return;
    }

    var host = this._host;
    var attackDirection = subject.position.clone();
    attackDirection.sub(host.position);
    if (this.direction.dot(attackDirection) < 0) {
        return false;
    }

    return true;
}

Game.traits.Door.prototype._detain = function(object, destination)
{
    this.traverseObject = object;
    this.traverseObject.collidable = false;
    this.traverseObject.physics.zero();
    this.traverseObject.physics.enabled = false;

    this.traverseObject.move.off();
    this.traverseDestination = destination;
    this.sequencer.step = 0;
}

Game.traits.Door.prototype._release = function()
{
    this.traverseObject.collidable = true;
    this.traverseObject.physics.enabled = true;
    this.traverseObject.move.on();
    this.traverseObject = undefined;
}
