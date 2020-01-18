const THREE = require('three');
const {Timeline} = require('@snakesilk/engine');
const {Solid} = require('@snakesilk/platform-traits');

class Elevator extends Solid
{
    constructor()
    {
        super();

        this.NAME = 'elevator';

        this._initialized = false;
        this._distance = 0;
        this._nodes = [];
        this._offset = new THREE.Vector2;
        this._origo = new THREE.Vector3;
        this._nextPos = new THREE.Vector2;
        this._timeline = new Timeline;

        this.fixed = true;
        this.obstructs = true;
        this.attackAccept = [this.TOP];
        this.speed = 10;
    }
    __timeshift(dt)
    {
        if (!this._enabled) {
            return;
        }
        if (!this._initialized) {
            this._initialize();
            this._initialized = true;
        }

        const pos = this._host.position;
        const next = this._nextPos;
        pos.copy(next);
        pos.z = this._origo.z;

        this._distance += this.speed * dt;

        const offset = this.getOffset(this._distance).add(this._origo);
        next.copy(offset);

        this._host.velocity.copy(next)
                           .sub(pos)
                           .divideScalar(dt);
    }
    _initialize()
    {
        const pos = this._host.position;
        this._origo.copy(pos);
        this._nextPos.copy(pos);
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

module.exports = Elevator;
