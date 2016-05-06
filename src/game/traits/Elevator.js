Game.traits.Elevator = function()
{
    Game.traits.Solid.call(this);

    this.fixed = true;
    this.obstructs = true;

    this.attackAccept = [this.TOP];
    this.distance = 0;
    this.origo = undefined;
    this.offset = new THREE.Vector2();
    this.paths = [];
    this.speed = 10;
    this.timeline = new Engine.Timeline();

    this._lastPos = new THREE.Vector2();
}

Engine.Util.extend(Game.traits.Elevator, Game.traits.Solid);

Game.traits.Elevator.prototype.NAME = 'elevator';

Game.traits.Elevator.prototype.__timeshift = function(deltaTime)
{
    this.distance += this.speed * deltaTime;

    var offset = this.resolvePosition(this.distance),
        p = this._host.position,
        z = p.z;

    if (this.origo === undefined) {
        this.origo = p.clone();
    }

    p.copy(this.origo).add(offset);
    p.z = z;

    this._host.velocity.copy(p).sub(this._lastPos).divideScalar(deltaTime);

    this._lastPos.copy(p);
}

Game.traits.Elevator.prototype.addNode = function(vec2)
{
    this.paths.push(vec2);
    this.timeline.addFrame(vec2, vec2.length());
}

Game.traits.Elevator.prototype.resolvePosition = function(distance)
{
    var resolution = this.timeline.resolveTime(distance),
        offset = new THREE.Vector2();

    for (var i = 0; i !== resolution.index; ++i) {
        offset.add(this.paths[i]);
    }

    var pos = this.paths[resolution.index].clone();
    pos.setLength(resolution.resolvedLength - resolution.passedLength);

    offset.add(pos);

    return offset;
}
