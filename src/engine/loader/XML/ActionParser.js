const Parser = require('./Parser');
const Easing = require('../../Easing');
const SyncPromise = require('../../SyncPromise');
const Tween = require('../../Tween');

class ActionParser extends Parser
{
    constructor()
    {
        super();

        this.DEGTORAD = Math.PI / 180;
    }
    getAction(node)
    {
        const conditionNodes = node.querySelectorAll(':scope > condition');
        const conditions = [];
        for (let conditionNode, j = 0; conditionNode = conditionNodes[j++];) {
            const values = this.getAttr(conditionNode, 'value')
                               .split('|')
                               .map(value => parseFloat(value) || value);
            conditions.push(values);
        }

        const callback = this._resolveFunction(node);

        if (conditions.length > 0) {
            const wrapper = function() {
                for (let i = 0; i < conditions.length; ++i) {
                    if (conditions[i].indexOf(arguments[i]) === -1) {
                        return;
                    }
                }
                callback.apply(this, arguments);
            };
            return wrapper;
        }

        return callback;
    }
    getEasing(node, attr)
    {
        const aggr = this.getAttr(node, attr);
        if (aggr) {
            const comp = aggr.split(',');
            const name = comp.shift();
            if (comp.length) {
                const val = parseFloat(comp[0]);
                return Easing[name](val);
            } else {
                return Easing[name]();
            }
        } else {
            return Easing.linear();
        }
    }
    _parseActionCameraMove(node)
    {
        const to = this.getVector3(node, 'to');
        const tweenNode = node.querySelector(':scope > tween');
        if (tweenNode) {
            const duration = this.getFloat(tweenNode, 'duration');
            const easing = this.getEasing(tweenNode, 'easing');
            return function cameraPanTo() {
                return this.camera.panTo(to, duration, easing);
            }
        } else {
            return function cameraJumpTo() {
                this.camera.position.copy(to);
            };
        }
    }
    _parseActionTransform(node)
    {
        const operations = [];
        const transNodes = node.querySelectorAll('opacity, position, rotation, scale');
        for (let node, i = 0; node = transNodes[i]; ++i) {
            const operation = this._parseTransformation(node);
            operations.push(operation);
        }

        const ids = [];
        const objectNodes = node.querySelectorAll('object');
        for (let node, i = 0; node = objectNodes[i]; ++i) {
            const id = this.getAttr(node, 'instance');
            ids.push(id);
        }

        return function transform() {
            const world = this.world;
            const tasks = [];
            ids.forEach(id => {
                const object = world.getObject(id);
                if (!object) {
                    throw new Error(`Object instance "${id}" not defined`);
                }
                operations.forEach(operation => {
                    const task = operation(object);
                    tasks.push(task);
                });
            });
            return SyncPromise.all(tasks);
        };
    }
    _parseTransformation(node)
    {
        let duration = 0;
        let easing;
        if (node.parentNode.tagName === 'tween') {
            duration = this.getFloat(node.parentNode, 'duration') || 0;
            easing = this.getEasing(node.parentNode, 'easing');
        }

        const type = node.tagName;
        if (type === 'opacity') {
            const to = this.getFloat(node, 'to');
            return function opacityTransform(object) {
                const tween = new Tween({opacity: to}, easing);
                tween.addSubject(object.model.material);
                return object.doFor(duration, (elapsed, progress) => {
                    tween.update(progress);
                });
            };
        } else if (type === 'position') {
            const to = this.getVector3(node, 'to');
            return function positionTransform(object) {
                const tween = new Tween(to, easing);
                tween.addSubject(object.position);
                return object.doFor(duration, (elapsed, progress) => {
                    tween.update(progress);
                });
            };
        } else if (type === 'rotation') {
            const to = this.getVector3(node, 'to');
            Object.keys(to).forEach(key => {
                if (to[key]) {
                    to[key] *= this.DEGTORAD;
                }
            });
            return function rotationTransform(object) {
                const tween = new Tween(to, easing);
                tween.addSubject(object.model.rotation);
                return object.doFor(duration, (elapsed, progress) => {
                    tween.update(progress);
                });
            };
        } else if (type === 'scale') {
            const to = this.getFloat(node, 'to');
            const vec = new THREE.Vector3(to, to, to);
            return function scaleTransform(object) {
                const tween = new Tween(to, easing);
                tween.addSubject(object.model.scale);
            };
        }
    }
    _resolveFunction(node)
    {
        const type = this.getAttr(node, 'type');

        if (type === 'camera-move') {
            return this._parseActionCameraMove(node);
        } else if (type === 'emit-audio') {
            const id = this.getAttr(node, 'id');
            return function emitAudio() {
                this.emitAudio(this.audio[id]);
            };
        } else if (type === 'emit-event') {
            const name = this.getAttr(node, 'name');
            return function emitEvent() {
                this.events.trigger(name, []);
            };
        } else if (type === 'play-audio') {
            const id = this.getAttr(node, 'id');
            return function playAudio() {
                this.audio.play(id);
            };
        } else if (type === 'stop-audio') {
            const id = this.getAttr(node, 'id');
            return function stopAudio() {
                this.audio.stop(id);
            };
        } else if (type === 'play-sequence') {
            const id = this.getAttr(node, 'id');
            return function playSequence() {
                return this.sequencer.playSequence(id);
            };
        } else if (type === 'set-animation') {
            const id = this.getAttr(node, 'id');
            return function setAnimation() {
                this.setAnimation(id);
            };
        } else if (type === 'transform') {
            return this._parseActionTransform(node);
        } else if (type === 'wait') {
            const duration = this.getFloat(node, 'duration') || 0;
            return function wait() {
                return this.waitFor(duration);
            };
        }

        throw new Error(`No action "${type}"`);
    }
}

module.exports = ActionParser;
