Game.traits.Elevator =
class Elevator extends Game.traits.Solid
{
    constructor()
    {
        super();

        this.NAME = 'elevator';

        this._timeline = new Engine.Timeline();
        this._paths = [];
        this._lastPos = new THREE.Vector2();

        this.fixed = true;
        this.obstructs = true;

        this.attackAccept = [this.TOP];
        this.distance = 0;
        this.origo = null;
        this.offset = new THREE.Vector2();

        this.speed = 10;
    }
    __timeshift(deltaTime)
    {
        this.distance += this.speed * deltaTime;

        const offset = this.resolvePosition(this.distance);
        const p = this._host.position;
        const z = p.z;

        if (this.origo === null) {
            this.origo = p.clone();
        }

        p.copy(this.origo).add(offset);
        p.z = z;

        this._host.velocity.copy(p).sub(this._lastPos).divideScalar(deltaTime);

        this._lastPos.copy(p);
    }
    addNode(vec2)
    {
        this._paths.push(vec2);
        this._timeline.addFrame(vec2, vec2.length());
    }
    resolvePosition(distance)
    {
        const resolution = this._timeline.resolveTime(distance);
        const offset = new THREE.Vector2();

        for (let i = 0; i !== resolution.index; ++i) {
            offset.add(this._paths[i]);
        }

        const pos = this._paths[resolution.index].clone();
        pos.setLength(resolution.resolvedLength - resolution.passedLength);

        offset.add(pos);

        return offset;
    }
}
