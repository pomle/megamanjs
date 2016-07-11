Game.traits.Elevator =
class Elevator extends Game.traits.Solid
{
    constructor()
    {
        super();

        this.NAME = 'elevator';

        this._distance = 0;
        this._nodes = [];
        this._offset = new THREE.Vector2;
        this._origo = null;
        this._offset = new THREE.Vector2;
        this._lastPos = new THREE.Vector2;
        this._timeline = new Engine.Timeline;
        this._velocity = new THREE.Vector2;

        this.fixed = true;
        this.obstructs = true;
        this.attackAccept = [this.TOP];
        this.speed = 10;
    }
    __collides(subject, ourZone, theirZone)
    {
        const attack = super.__collides(subject, ourZone, theirZone);
        if (attack === subject.SURFACE_TOP && subject.physics) {
            subject.physics.velocity.copy(this._velocity);
        }
    }
    __timeshift(deltaTime)
    {
        this._distance += this.speed * deltaTime;

        const offset = this.getOffset(this._distance);
        const pos = this._host.position;
        const z = pos.z;

        if (!this._origo) {
            this._origo = pos.clone();
        }

        pos.copy(this._origo).add(offset);
        pos.z = z;

        this._velocity.copy(pos)
                      .sub(this._lastPos)
                      .divideScalar(deltaTime);

        this._lastPos.copy(pos);
    }
    addNode(vec2)
    {
        this._nodes.push(vec2);
        this._timeline.addFrame(vec2, vec2.length());
    }
    getOffset(distance)
    {
        const resolution = this._timeline.resolveTime(distance);
        const offset = this._offset;
        offset.set(0, 0);

        for (let i = 0; i !== resolution.index; ++i) {
            offset.add(this._nodes[i]);
        }

        const pos = this._nodes[resolution.index].clone();
        pos.setLength(resolution.resolvedLength - resolution.passedLength);

        offset.add(pos);

        return offset;
    }
}
