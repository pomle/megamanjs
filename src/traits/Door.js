const {Vector2} = require('three');
const {Solid} = require('@snakesilk/platform-traits');
const Sequencer = require('./helper/Sequencer');
const vectorTraverse = require('./helper/vectorTraverse');

class Door extends Solid
{
    constructor()
    {
        super();

        this.NAME = 'door';

        this.fixed = true;
        this.obstructs = true;

        this.direction = new Vector2(0, 0);
        this.duration = .6;
        this.enabled = true;
        this.oneWay = false;
        this.speed = 30;

        this._traverseDestination = null;
        this._traverseObject = null;

        function accordion(geometry, start, step)
        {
            for (let i = start, l = geometry.vertices.length; i < l; ++i) {
                const v = geometry.vertices[i];
                v.y += step;
            }
            geometry.verticesNeedUpdate = true;
        }


        let step = 0;
        let stepTime = 0;
        let stepLength;

        this.sequencer = new Sequencer();
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
            return vectorTraverse(this._traverseObject.position,
                                    this._traverseDestination,
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
    __collides(withObject, ourZone, theirZone)
    {
        if (this._accept(withObject)) {
            const host = this._host;
            const width = (ourZone.width + theirZone.width) / 2;
            const dest = new Vector2(host.position.x + (host.position.x < withObject.position.x ? -width : width),
                                     withObject.position.y);
            if (this.oneWay) {
                this.enabled = false;
            }
            this._detain(withObject, dest);
        }
        else {
            super.__collides(withObject, ourZone, theirZone);
        }
    }
    __timeshift(dt)
    {
        if (this.sequencer.step > -1) {
            if (this._traverseObject) {
                this._traverseObject.velocity.copy(this._host.velocity);
            }
            this.sequencer.run(this, [dt]);
        }
    }
    _accept(subject)
    {
        if (this.enabled !== true) {
            return false;
        }

        if (!subject.isPlayer) {
            return false;
        }

        if (this._traverseObject !== null) {
            return false;
        }

        // Ignore collisions with currently handled object.
        if (subject === this._traverseObject) {
            return;
        }

        const host = this._host;
        const attackDirection = subject.position.clone();
        attackDirection.sub(host.position);
        if (this.direction.dot(attackDirection) < 0) {
            return false;
        }

        return true;
    }
    _detain(object, destination)
    {
        object.collidable = false;
        if (object.physics) {
            object.physics.zero();
            object.physics.disable();
        }
        if (object.move) {
            object.move.disable();
        }

        this._traverseObject = object;
        this._traverseDestination = destination;
        this.sequencer.start();
    }
    _release()
    {
        const object = this._traverseObject;
        object.collidable = true;
        if (object.physics) {
            object.physics.enable();
        }
        if (object.move) {
            object.move.enable();
        }
        this._traverseObject = null;
    }
}

module.exports = Door;
