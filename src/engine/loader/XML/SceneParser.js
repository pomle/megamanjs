const THREE = require('three');

const Parser = require('./Parser');
const EventParser = require('./EventParser');
const ObjectParser = require('./ObjectParser');
const SequenceParser = require('./SequenceParser');
const TraitParser = require('./TraitParser');

const Entity = require('../../Object');
const Scene = require('../../Scene');

const Climbable = require('../../traits/Climbable');
const DeathZone = require('../../traits/DeathZone');
const Solid = require('../../traits/Solid');

class SceneParser extends Parser
{
    constructor(loader, node)
    {
        super(loader);

        this.DEFAULT_POS = new THREE.Vector3(0, 0, 0);
        this.BEHAVIOR_MAP = {
            'climbables': this._createClimbable,
            'deathzones': this._createDeathZone,
            'solids': this._createSolid,
        };

        this._node = node;
        this._scene = null;
        this._objects = {};
        this._bevahiorObjects = [];
        this._layoutObjects = [];
    }
    _createClimbable()
    {
        const object = new Entity();
        object.applyTrait(new Climbable);
        return object;
    }
    _createDeathZone()
    {
        const object = new Entity();
        object.applyTrait(new DeathZone);
        return object;
    }
    _createSolid() {
        const object = new Entity();
        const solid = new Solid;
        solid.fixed = true;
        solid.obstructs = true;
        object.applyTrait(solid);
        return object;
    }
    getBehavior(node)
    {
        const type = node.parentNode.tagName.toLowerCase();
        if (!this.BEHAVIOR_MAP[type]) {
            throw new Error('Behavior ' + type + ' not in behavior map');
        }
        const factory = this.BEHAVIOR_MAP[type];
        const rect = this.getRect(node);
        const instance = factory();
        instance.addCollisionRect(rect.w, rect.h);
        instance.position.x = rect.x;
        instance.position.y = rect.y;
        instance.position.z = 0;

        return {
            constructor: constructor,
            instance: instance,
            node: node,
        };
    }
    getScene()
    {
        if (!this._promise) {
            this._promise = this._parse();
        }
        return this._promise.then(scene => {
            scene.name = this._node.getAttribute('name');

            /* Perform update to "settle" world.
               This is done to prevent audio and other side effects
               from leaking out on scene start. */
            scene.world.simulateTime(0);
            return scene;
        });
    }
    _createObject(id)
    {
        return new (this._getObject(id)).constructor;
    }
    _getObject(id)
    {
        const resource = this.loader.resourceManager;
        if (this._objects[id]) {
            return this._objects[id];
        } else if (resource.has('object', id)) {
            return {constructor: resource.get('object', id)};
        }
        throw new Error(`Object "${id}" not defined.`);
    }
    _parse()
    {
        if (this._node.tagName !== 'scene') {
            throw new TypeError('Node not <scene>');
        }

        this._scene = new Scene();

        this._parseAudio();
        this._parseCamera();
        this._parseEvents();
        this._parseBehaviors();
        this._parseCamera();
        this._parseGravity();
        this._parseSequences();

        return this._parseObjects().then(() => {
            return this._parseLayout();
        }).then(() => {
            return this.loader.resourceLoader.complete();
        }).then(() => {
            return this._scene;
        });
    }
    _parseAudio()
    {
        const scene = this._scene;
        const nodes = this._node.querySelectorAll(':scope > audio > *');
        const tasks = [];
        for (let node, i = 0; node = nodes[i++];) {
            const id = this.getAttr(node, 'id');
            const task = this.getAudio(node).then(audio => {
                scene.audio.add(id, audio);
            });
            tasks.push(task);
        }
        return Promise.all(tasks);
    }
    _parseBehaviors()
    {
        const nodes = this._node.querySelectorAll(':scope > layout > behaviors > * > rect');
        const world = this._scene.world;
        for (let node, i = 0; node = nodes[i]; ++i) {
            const object = this.getBehavior(node);
            this._bevahiorObjects.push(object);
            world.addObject(object.instance);
        }
        return Promise.resolve();
    }
    _parseCamera()
    {
        const cameraNode = this._node.querySelector(':scope > camera');
        if (cameraNode) {
            const camera = this._scene.camera;
            const smoothing = this.getFloat(cameraNode, 'smoothing');
            if (smoothing) {
                camera.smoothing = smoothing;
            }

            const posNode = cameraNode.querySelector(':scope > position');
            if (posNode) {
                const position = this.getPosition(posNode);
                camera.position.copy(position);
            }

            const pathNodes = cameraNode.querySelectorAll(':scope > path');
            for (let pathNode, i = 0; pathNode = pathNodes[i]; ++i) {
                const path = this.getCameraPath(pathNode);
                camera.addPath(path);
            }
        }

        return Promise.resolve();
    }
    _parseEvents()
    {
        this._parseGlobalEvents();

        const node = this._node.querySelector(':scope > events');
        if (!node) {
            return Promise.resolve();
        }

        const parser = new EventParser(this.loader, node);
        return parser.getEvents().then(events => {
            const scene = this._scene;
            events.forEach(event => {
                scene.events.bind(event.name, event.callback);
            });
        });
    }
    _parseGlobalEvents()
    {
        const eventsNode = this._node.querySelector(':scope > events');
        if (!eventsNode) {
            return;
        }
        const nodes = eventsNode.querySelectorAll('after > action, before > action');
        const scene = this._scene;
        for (let node, i = 0; node = nodes[i]; ++i) {
            const when = node.parentNode.tagName;
            const type = node.getAttribute('type');
            if (when === 'after' && type === 'goto-scene') {
                const id = node.getAttribute('id');
                scene.events.bind(scene.EVENT_END, () => {
                    this.loader.loadSceneByName(id).then(scene => {
                        this.loader.game.setScene(scene);
                    });
                })
            } else {
                throw new TypeError(`No mathing event for ${when} > ${type}`);
            }
        }
    }
    _parseGravity()
    {
        const node = this._node.getElementsByTagName('gravity')[0];
        if (node) {
            const gravity = this.getVector2(node);
            this._scene.world.gravityForce.copy(gravity);
        }
        return Promise.resolve();
    }
    _parseLayout()
    {
        const objectNodes = this._node.querySelectorAll(':scope > layout > objects > object');
        const world = this._scene.world;
        for (let objectNode, i = 0; objectNode = objectNodes[i]; ++i) {
            const layoutObject = this._parseLayoutObject(objectNode);
            world.addObject(layoutObject.instance);
            this._layoutObjects.push(layoutObject);
        }
        return Promise.resolve();
    }
    _parseLayoutObject(node)
    {
        const objectId = node.getAttribute('id');
        const instanceId = node.getAttribute('instance');
        const object = this._getObject(objectId);
        const instance = new object.constructor;
        instance.id = instanceId;

        const direction = this.getInt(node, 'dir') || 1;
        const position = this.getPosition(node) || this.DEFAULT_POS;

        instance.direction.set(direction, 0);
        instance.position.copy(position);

        if (instance.model) {
            const scale = this.getFloat(node, 'scale') || 1;
            instance.model.scale.multiplyScalar(scale);
        }

        const traitNodes = node.getElementsByTagName('trait');
        if (traitNodes) {
            const traitParser = new TraitParser();
            const traits = [];
            for (let traitNode, i = 0; traitNode = traitNodes[i++];) {
                const Trait = traitParser.parseTrait(traitNode);
                const trait = new Trait;
                instance.applyTrait(trait);
            }
        }

        return {
            sourceNode: object.node,
            node: node,
            constructor: object.constructor,
            instance: instance,
        };
    }
    _parseObjects()
    {
        const nodes = this._node.querySelectorAll(':scope > objects');
        if (!nodes.length) {
            return Promise.resolve();
        }

        const tasks = [];
        for (let node, i = 0; node = nodes[i++];) {
            const parser = new ObjectParser(this.loader, node);
            const task = parser.getObjects().then(objects => {
                Object.assign(this._objects, objects);
            });
            tasks.push(task);
        }

        return Promise.all(tasks);
    }
    _parseSequences()
    {
        const parser = new SequenceParser();
        const node = this._node.querySelector(':scope > sequences');
        if (node) {
            const seq = this._scene.sequencer;
            parser.getSequences(node).forEach(item => {
                seq.addSequence(item.id, item.sequence);
            });
        }
    }
}

module.exports = SceneParser;
