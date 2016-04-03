Game.Loader.XML.Parser.LevelParser = function(loader)
{
    Game.Loader.XML.Parser.call(this, loader);


}

Engine.Util.extend(Game.Loader.XML.Parser.LevelParser,
                   Game.Loader.XML.Parser);

Game.Loader.XML.Parser.LevelParser.prototype.createBehavior = function(node, behavior)
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
    object.model.visible = false;
    object.position.x = rect.x;
    object.position.y = rect.y;
    object.position.z = 0;

    return object;
}

Game.Loader.XML.Parser.LevelParser.prototype.parse = function(levelNode, callback)
{
    if (levelNode.tagName !== 'scene' || levelNode.getAttribute('type') !== 'level') {
        throw new TypeError('Node not <scene type="level">');
    }

    return new Promise(function(resolve) {
        var world = new Engine.World();
        var level = new Game.scenes.Level(this.loader.game, world);

        var objectsNode = levelNode.getElementsByTagName('objects')[0];
        var objects;
        if (objectsNode) {
            var objectParser = new Game.Loader.XML.Parser.ObjectParser();
            objects = objectParser.parse(objectsNode);
        }

        this.parseCamera(levelNode, level);
        this.parseGravity(levelNode);

        var layoutNode = levelNode.getElementsByTagName('layout')[0];
        this.parseBackgrounds(layoutNode, objects).forEach(function(object) {
            level.world.addObject(object);
        });
        this.parseBehaviors(layoutNode).forEach(function(object) {
            level.world.addObject(object);
        });
        //this.parseSpawners(layoutNode);

        this.parseObjectLayout(layoutNode, objects).forEach(function(object) {
            level.world.addObject(object);
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
        /*
        levelNode.find('> scripts > bootstrap').each(function(i, node) {
            try {
                switch (node.tagName) {
                    case 'bootstrap':
                        (function() {
                            var bootstrap = undefined;
                            eval(node.textContent);
                            if (typeof bootstrap === "function") {
                                bootstrap(loader.game, level);
                            }
                        }());
                        break;
                }
            }
            catch (error) {
                console.error("Could not parse XML script in node <%s>", node.tagName, error);
            }
        });*/

        resolve(level);
    }.bind(this));
}

Game.Loader.XML.Parser.LevelParser.prototype.parseBackgrounds = function(layoutNode, objects)
{
    var backgrounds = [];
    var backgroundNodes = layoutNode.getElementsByTagName('background');
    for (var backgroundNode, i = 0; backgroundNode = backgroundNodes[i++];) {
        var objectId = backgroundNode.getAttribute('model');
        if (!objectId) {
            throw new Error("Could not find object id on " + backgroundNode.outerHTML);
        }
        if (!objects[objectId]) {
            throw new Error("Object " + objectId + " not defined");
        }
        var background = new objects[objectId]();
        var position = this.getPosition(backgroundNode);
        background.position.x = position.x;
        background.position.y = position.y;
        background.position.z = position.z;
    }
    return backgrounds;
}

Game.Loader.XML.Parser.LevelParser.prototype.parseBehaviors = function(layoutNode)
{
    var behaviorsNode = layoutNode.getElementsByTagName('behaviors')[0];
    var behaviors = [];
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
    return behaviors;
}

Game.Loader.XML.Parser.LevelParser.prototype.parseCamera = function(levelNode, level)
{
    var cameraNode = levelNode.getElementsByTagName('camera')[0];
    if (cameraNode) {
        var smoothing = this.getFloat(cameraNode, 'smoothing');
        if (isFinite(smoothing)) {
            level.camera.smoothing = smoothing;
        }

        var posNode = cameraNode.getElementsByTagName('position')[0];
        if (posNode) {
            var position = this.getPosition(posNode);
            level.camera.camera.position.copy(position);
        }
    }

    var pathNodes = cameraNode.getElementsByTagName('path');
    if (pathNodes) {
        for (var pathNode, i = 0; pathNode = pathNodes[i++];) {
            var path = this.getCameraPath(pathNode);
            level.camera.addPath(path);
        }
    }
}

Game.Loader.XML.Parser.LevelParser.prototype.parseGravity = function(levelNode)
{
    var gravityNode = levelNode.getElementsByTagName('gravity')[0];
    if (gravityNode) {
        var gravity = this.getVector2(gravityNode);
        level.world.gravityForce.copy(gravity);
    }
}

Game.Loader.XML.Parser.LevelParser.prototype.parseObject = function(objectNode, objects) {
    var objectId = objectNode.getAttribute('id');
    if (!objects[objectId]) {
        throw new Error('Object id "' + objectId + '" not defined');
    }
    var constructor = objects[objectId];

    var object = new constructor();
    var position = this.getPosition(objectNode);
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

Game.Loader.XML.Parser.LevelParser.prototype.parseObjectLayout = function(layoutNode, objects)
{
    var layoutObjects = [];
    var objectNodes = layoutNode.getElementsByTagName('object');
    for (var objectNode, i = 0; objectNode = objectNodes[i++];) {
        var layoutObject = this.parseObject(objectNode, objects);
        layoutObjects.push(layoutObject);
    };
    return layoutObjects;
}

Game.Loader.XML.Parser.LevelParser.prototype.parseSpawners = function(layoutNode)
{
    var parser = this;
    var level = parser.level;
    var loader = parser.loader;

    layoutNode.find(' > spawner').each(function() {
        var spawnerNode = $(this);
        var spawner = new Game.objects.Spawner();
        var position = parser.getPosition(spawnerNode);
        spawner.position.copy(position);
        spawner.position.z = -10;

        spawnerNode.find('> character').each(function() {
            var objectNode = $(this);
            var objectId = objectNode.attr('id');
            var objectRef = loader.resource.get('character', objectId);
            if (!objectRef) {
                console.error("Character " + objectId + " not found");
                return;
            }
            spawner.pool.push(objectRef);
        });

        spawner.count = parser.getFloat(spawnerNode, 'count', Infinity);
        spawner.maxSimultaneousSpawns = parser.getFloat(spawnerNode, 'simultaneous', 1);
        spawner.interval = parser.getFloat(spawnerNode, 'interval', 0);
        spawner.minDistance = parser.getFloat(spawnerNode, 'min-distance', spawner.minDistance);
        spawner.maxDistance = parser.getFloat(spawnerNode, 'max-distance', spawner.maxDistance);

        level.world.addObject(spawner);
    });
}
