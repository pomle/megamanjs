'use strict';

Game.Loader.XML.LevelParser =
class LevelParser
extends Game.Loader.XML.SceneParser
{
    constructor(loader, node)
    {
        if (node.tagName !== 'scene' || node.getAttribute('type') !== 'level') {
            throw new TypeError('Node not <scene type="level">');
        }

        super(loader);

        this.DEFAULT_POS = new THREE.Vector3(0, 0, 0);
        this.BEHAVIOR_MAP = {
            'climbables': Game.objects.Climbable,
            'deathzones': Game.objects.obstacles.DeathZone,
            'environments': Engine.Object,
            'solids': Game.objects.Solid,
        };

        this._node = node;
        this._scene = new Game.scenes.Level();

        this._layoutObjects = null;
    }
    _parse()
    {
        this._parseAudio();
        this._parseEvents();
        this._parseMusic();
        this._parseBehaviors();
        this._parseCamera();
        this._parseCheckpoints();
        this._parseGravity();
        this._parseSpawners();
        this._parseText();

        this._parseObjects().then(() => {
            return this._parseLayout();
        }).then(() => {
            return this._parseScripts();
        });

        return this.loader.resourceLoader.complete().then(() => {
            return this._scene;
        });
    }
    _parseBehaviors()
    {
        const nodes = this._node.querySelectorAll(':scope > layout > behaviors > * > rect');
        const world = this._scene.world;
        for (let node, i = 0; node = nodes[i]; ++i) {
            const type = node.parentNode.tagName;
            if (!this.BEHAVIOR_MAP[type]) {
                throw new Error('Behavior ' + type + ' not in behavior map');
            }
            const rect = this.getRect(node);
            const object = new this.BEHAVIOR_MAP[type];
            object.addCollisionRect(rect.w, rect.h);
            object.position.x = rect.x;
            object.position.y = rect.y;
            object.position.z = 0;

            world.addObject(object);
        }
        return Promise.resolve();
    }
    _parseCamera()
    {
        const cameraNode = this._node.querySelector(':scope > camera');
        if (cameraNode) {
            const camera = this._scene.world.camera;
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
    _parseCheckpoints()
    {
        const checkpointNodes = this._node.querySelectorAll(':scope > checkpoints > checkpoint');
        const level = this._scene;
        for (let checkpointNode, i = 0; checkpointNode = checkpointNodes[i]; ++i) {
            const p = this.getPosition(checkpointNode);
            const r = this.getFloat(checkpointNode, 'radius') || undefined;
            level.addCheckPoint(p.x, p.y, r);
        }
        return Promise.resolve();
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
    _parseMusic()
    {
        const musicNode = this._node.querySelector(':scope > audio > music');
        if (musicNode) {
            const scene = this._scene;
            const id = this.getAttr(musicNode, 'id')
            scene.events.bind(scene.EVENT_PLAYER_RESET, function() {
                this.playAudio(id);
            });
            scene.events.bind(scene.EVENT_PLAYER_DEATH, function() {
                this.stopAudio(id);
            });
        }
    }
    _parseLayout()
    {
        this._layoutObjects = [];
        const objectNodes = this._node.querySelectorAll(':scope > layout > objects > object');
        const world = this._scene.world;
        for (let objectNode, i = 0; objectNode = objectNodes[i]; ++i) {
            const layoutObject = this._parseLayoutObject(objectNode);
            world.addObject(layoutObject.instance);
            this._layoutObjects.push(layoutObject);
        };
        return Promise.resolve();
    }
    _parseLayoutObject(node)
    {
        const objectId = node.getAttribute('id');
        const resource = this.loader.resourceManager;

        let object;
        if (this._objects[objectId]) {
            object = this._objects[objectId];
        } else if (resource.has('object', objectId)) {
            object = resource.get('object', objectId);
        } else {
            throw new Error('Object id "' + objectId + '" not defined');
        }

        const instance = new object.constructor;
        const position = this.getPosition(node) || this.DEFAULT_POS;
        instance.position.copy(position);

        const traitNodes = node.getElementsByTagName('trait');
        if (traitNodes) {
            const traitParser = new Game.Loader.XML.TraitParser();
            const traits = [];
            for (let traitNode, i = 0; traitNode = traitNodes[i++];) {
                const Trait = traitParser.parseTrait(traitNode);
                const trait = new Trait;
                instance.applyTrait(trait);
            }
        }

        return {
            node: node,
            constructor: object.constructor,
            instance: instance,
        };
    }
    _parseSpawners()
    {
        const world = this._scene.world;
        const spawnerNodes = this._node.querySelectorAll('layout > spawner');
        for (let spawnerNode, i = 0; spawnerNode = spawnerNodes[i]; ++i) {
            const spawner = new Game.objects.Spawner();
            const position = this.getPosition(spawnerNode);
            spawner.position.copy(position);
            spawner.position.z = 0;

            const spawnableNodes = spawnerNode.getElementsByTagName('*');
            for (let spawnableNode, j = 0; spawnableNode = spawnableNodes[j]; ++j) {
                const objectId = spawnableNode.getAttribute('id');
                const objectRef = this.loader.resourceManager.get('character', objectId);
                spawner.pool.push(objectRef);
            }

            spawner.count = this.getFloat(spawnerNode, 'count') || Infinity;
            spawner.maxSimultaneousSpawns = this.getFloat(spawnerNode, 'simultaneous') || 1;
            spawner.interval = this.getFloat(spawnerNode, 'interval') || 0;
            spawner.minDistance = this.getFloat(spawnerNode, 'min-distance') || spawner.minDistance;
            spawner.maxDistance = this.getFloat(spawnerNode, 'max-distance') || spawner.maxDistance;

            world.addObject(spawner);
        }
        return Promise.resolve();
    }
    _parseScripts(scriptsNode, level)
    {
        const scriptNodes = this._node.querySelectorAll(':scope > scripts > *');
        for (let scriptNode, i = 0; scriptNode = scriptNodes[i++];) {
            const type = scriptNode.tagName;
            const func = eval(scriptNode.textContent);
            if (typeof func === "function") {
                if (type === 'bootstrap') {
                    func(level);
                }
            }
        }
    }
    _parseText()
    {
        const res = this.loader.resourceManager;
        if (res.has('font', 'nintendo')) {
            this._scene.assets['start-caption'] = res.get('font', 'nintendo')('READY').createMesh();
        }
    }
}
