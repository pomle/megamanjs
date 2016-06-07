'use strict';

Game.Loader.XML.Parser.LevelParser =
class LevelParser
extends Game.Loader.XML.Parser.SceneParser
{
    constructor(loader)
    {
        super(loader);
        this.DEFAULT_POS = new THREE.Vector3(0, 0, 0);
        this._scene = new Game.scenes.Level();
    }
    createBehavior(node, behavior)
    {
        var behaviorMap = {
            'deathzones': Game.objects.obstacles.DeathZone,
            'environments': Engine.Object,
            'solids': Game.objects.Solid,
            'climbables': Game.objects.Climbable,
        };

        if (behaviorMap[behavior] === undefined) {
            throw new Error('Behavior ' + behavior + ' not in behavior map');
        }

        var rect = this.getRect(node);
        var object = new behaviorMap[behavior];
        object.addCollisionRect(rect.w, rect.h);
        object.position.x = rect.x;
        object.position.y = rect.y;
        object.position.z = 0;

        return object;
    }
    parse(levelNode, callback)
    {
        if (levelNode.tagName !== 'scene' || levelNode.getAttribute('type') !== 'level') {
            throw new TypeError('Node not <scene type="level">');
        }

        var loader = this.loader;
        var resource = this.loader.resourceManager;

        return new Promise(resolve => {
            const level = this._scene;

            var audioNode = levelNode.getElementsByTagName('audio')[0];
            var musicNode = audioNode.getElementsByTagName('music')[0];
            this.getAudio(musicNode)
                .then(audio => {
                    const id = this.getAttr(audioNode, 'id');
                    level.audio[id] = audio;
                });

            this.parseEvents(levelNode);

            level.assets['start-caption'] = resource.get('font', 'nintendo')('READY').createMesh();

            var objectsNode = levelNode.getElementsByTagName('objects')[0];
            var objects;
            if (objectsNode) {
                var objectParser = new Game.Loader.XML.Parser.ObjectParser(this.loader);
                objects = objectParser.parse(objectsNode);
            }

            this.parseCamera(levelNode, level);

            var gravity = this.parseGravity(levelNode);
            if (gravity) {
                level.world.gravityForce.copy(gravity);
            }

            var layoutNode = levelNode.getElementsByTagName('layout')[0];

            this.parseObjectLayout(layoutNode, objects).forEach(function(object) {
                level.world.addObject(object);
            });

            this.parseBehaviors(layoutNode).forEach(function(object) {
                level.world.addObject(object);
            });

            this.parseSpawners(layoutNode).forEach(function(object) {
                level.world.addObject(object)
            });


            var checkpointsNode = levelNode.getElementsByTagName('checkpoints')[0];
            if (checkpointsNode) {
                var checkpointNodes = checkpointsNode.getElementsByTagName('checkpoint');
                for (var checkpointNode, i = 0; checkpointNode = checkpointNodes[i++];) {
                    var c = this.getPosition(checkpointNode);
                    var r = this.getFloat(checkpointNode, 'radius') || undefined;
                    level.addCheckPoint(c.x, c.y, r);
                }
            }

            var scriptsNode = levelNode.getElementsByTagName('scripts')[0];
            if (scriptsNode) {
                this.parseScripts(scriptsNode, level);
            }

            this.loader.resourceLoader.complete().then(() => {
                resolve(level);
            });
        });
    }
    parseBehaviors(layoutNode)
    {
        var behaviors = [];
        var behaviorsNode = layoutNode.getElementsByTagName('behaviors')[0];
        if (behaviorsNode) {
            for (var behaviorNode, i = 0; behaviorNode = behaviorsNode.childNodes[i++];) {
                var type = behaviorNode.tagName;
                if (type) {
                    for (var rectNode, j = 0; rectNode = behaviorNode.childNodes[j++];) {
                        if (rectNode.tagName) {
                            behaviors.push(this.createBehavior(rectNode, type));
                        }
                    }
                }
            }
        }
        return behaviors;
    }
    parseCamera(levelNode, level)
    {
        var cameraNode = levelNode.getElementsByTagName('camera')[0];
        if (cameraNode) {
            var smoothing = this.getFloat(cameraNode, 'smoothing');
            if (smoothing) {
                level.world.camera.smoothing = smoothing;
            }

            var posNode = cameraNode.getElementsByTagName('position')[0];
            if (posNode) {
                var position = this.getPosition(posNode);
                level.world.camera.position.copy(position);
            }

            var pathNodes = cameraNode.getElementsByTagName('path');
            if (pathNodes) {
                for (var pathNode, i = 0; pathNode = pathNodes[i++];) {
                    var path = this.getCameraPath(pathNode);
                    level.world.camera.addPath(path);
                }
            }
        }
    }
    parseGravity(levelNode)
    {
        var gravityNode = levelNode.getElementsByTagName('gravity')[0];
        if (gravityNode) {
            var gravity = this.getVector2(gravityNode);
            return gravity;
        }
        return false;
    }
    parseObject(objectNode, objects)
    {
        var objectId = objectNode.getAttribute('id');
        var constructor;
        const resource = this.loader.resourceManager;

        if (objects[objectId]) {
            constructor = objects[objectId];
        } else if (resource.has('object', objectId)) {
            constructor = resource.get('object', objectId);
        } else {
            throw new Error('Object id "' + objectId + '" not defined');
        }

        var object = new constructor();
        var position = this.getPosition(objectNode) || this.DEFAULT_POS;
        object.position.copy(position);

        var traitNodes = objectNode.getElementsByTagName('trait');
        if (traitNodes) {
            var traitParser = new Game.Loader.XML.Parser.TraitParser();
            var traits = [];
            for (var traitNode, i = 0; traitNode = traitNodes[i++];) {
                var Trait = traitParser.parseTrait(traitNode);
                var trait = new Trait();
                object.applyTrait(trait);
            }
        }
        return object;
    }
    parseObjectLayout(layoutNode, objects)
    {
        var layoutObjects = [];
        var objectNodes = layoutNode.getElementsByTagName('object');
        for (var objectNode, i = 0; objectNode = objectNodes[i++];) {
            var layoutObject = this.parseObject(objectNode, objects);
            layoutObjects.push(layoutObject);
        };
        return layoutObjects;
    }
    parseSpawners(layoutNode)
    {
        var spawners = [];
        var spawnerNodes = layoutNode.getElementsByTagName('spawner');
        for (var spawnerNode, i = 0; spawnerNode = spawnerNodes[i]; ++i) {
            var spawner = new Game.objects.Spawner();
            var position = this.getPosition(spawnerNode);
            spawner.position.copy(position);
            spawner.position.z = 0;

            var spawnableNodes = spawnerNode.getElementsByTagName('*');
            for (var spawnableNode, j = 0; spawnableNode = spawnableNodes[j]; ++j) {
                var objectId = spawnableNode.getAttribute('id');
                var objectRef = this.loader.resourceManager.get('character', objectId);
                spawner.pool.push(objectRef);
            }

            spawner.count = this.getFloat(spawnerNode, 'count') || Infinity;
            spawner.maxSimultaneousSpawns = this.getFloat(spawnerNode, 'simultaneous') || 1;
            spawner.interval = this.getFloat(spawnerNode, 'interval') || 0;
            spawner.minDistance = this.getFloat(spawnerNode, 'min-distance') || spawner.minDistance;
            spawner.maxDistance = this.getFloat(spawnerNode, 'max-distance') || spawner.maxDistance;

            spawners.push(spawner);
        }
        return spawners;
    }
    parseScripts(scriptsNode, level)
    {
        var scriptNodes = scriptsNode.getElementsByTagName('*');
        var loader = this.loader;
        for (var scriptNode, i = 0; scriptNode = scriptNodes[i]; ++i) {
            if (scriptNode.tagName === 'bootstrap') {
                (function() {
                    var bootstrap = undefined;
                    eval(scriptNode.textContent);
                    if (typeof bootstrap === "function") {
                        bootstrap(loader.game, level);
                    }
                }());
            }
        }
    }
}
