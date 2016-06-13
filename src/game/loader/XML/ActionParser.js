'use strict';

Game.Loader.XML.ActionParser =
class ActionParser
extends Game.Loader.XML.Parser
{
    constructor()
    {
        super();
    }
    getAction(node)
    {
        const conditionNodes = node.querySelectorAll(':scope > condition');
        const conditions = [];
        for (let conditionNode, j = 0; conditionNode = conditionNodes[j++];) {
            const value = this.getFloat(conditionNode, 'value') || this.getAttr(conditionNode, 'value');
            conditions.push(value);
        }

        const callback = this._resolveFunction(node);

        if (conditions.length > 0) {
            const wrapper = function() {
                for (let i = 0; i < conditions.length; ++i) {
                    if (arguments[i] != conditions[i]) {
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
        const comp = aggr.split(',');
        const name = comp.shift();
        if (comp.length) {
            const val = parseFloat(comp[0]);
            return Engine.Easing[name](val);
        } else {
            return Engine.Easing[name];
        }
    }
    getInterpolation(node)
    {
        const duration = this.getFloat(node, 'duration') || 0;
        const easing = this.getEasing(node, 'easing');
        return {
            duration,
            easing,
        };
    }
    _resolveFunction(node)
    {
        const type = this.getAttr(node, 'type');
        const id = this.getAttr(node, 'id');

        if (type === 'camera-move') {
            const aggr = this.getAttr(node, 'to').split(',');
            const to = new THREE.Vector3(parseFloat(aggr[0]) || undefined,
                                         parseFloat(aggr[1]) || undefined,
                                         parseFloat(aggr[2]) || undefined);
            const interpolationNode = node.querySelector(':scope > interpolation');
            if (interpolationNode) {
                const inter = this.getInterpolation(interpolationNode);
                return function cameraPanTo() {
                    const c = this.camera.position;
                    const d = new THREE.Vector3(to.x || c.x, to.y || c.y, to.z || c.z);
                    return this.camera.panTo(d, inter.duration, inter.easing);
                }
            } else {
                return function cameraJumpTo() {
                    this.camera.position.copy(to);
                };
            }
        } else if (type === 'emit-event') {
            const name = this.getAttr(node, 'name');
            return function emitEvent() {
                this.events.trigger(name, []);
            };
        } else if (type === 'play-audio') {
            return function playAudio() {
                this.playAudio(id);
            };
        } else if (type === 'stop-audio') {
            return function stopAudio() {
                this.stopAudio(id);
            };
        } else if (type === 'emit-audio') {
            return function emitAudio() {
                this.world.emitAudio(this.audio[id]);
            };
        } else if (type === 'play-sequence') {
            return function playSequence() {
                return this.playSequence(id);
            };
        } else if (type === 'wait') {
            const duration = this.getFloat(node, 'duration') || 0;
            return function wait() {
                return this.timer.waitFor(duration);
            };
        }

        throw new Error(`No action "${type}"`);
    }
}
