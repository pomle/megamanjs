Game.Loader.XML.Parser.LevelParser = function(loader)
{
    Game.Loader.XML.Parser.call(this, loader);
    this.world = undefined;
    this.level = undefined;

    this.behaviors = new Set();
    this.items = new Set();
    this.objects = {};
    this.textures = [];
}

Engine.Util.extend(Game.Loader.XML.Parser.LevelParser,
                   Game.Loader.XML.Parser);


Game.Loader.XML.Parser.LevelParser.prototype.createBehavior = function(node, behavior)
{
    var parser = this,
        objectParser = new Game.Loader.XML.Parser.ObjectParser();

    var behaviorMap = {
        'deathzones': Game.objects.obstacles.DeathZone,
        'environments': Engine.Object,
        'solids': Game.objects.Solid,
        'climbables': Game.objects.Climbable,
    }

    function createObject(node, constructor)
    {
        node = $(node);
        var rect = parser.getRect(node);

        var object = objectParser.createObject('behavior', constructor, function()
        {
            constructor.call(this);
            this.model.visible = false;
            this.addCollisionRect(rect.w, rect.h);

            node.find('> trait').each(function() {
                var traitDescriptor = parser.getTrait($(this));
                parser.applyTrait(object, traitDescriptor);
            });
        });

        var instance = new object();
        instance.position.x = rect.x;
        instance.position.y = rect.y;
        instance.position.z = 0;

        parser.behaviors.add({
            node: node[0],
            object: instance,
        });

        return instance;
    }

    if (behaviorMap[behavior] === undefined) {
        throw new Error('Behavior ' + behavior + ' not in behavior map');
    }

    return createObject(node, behaviorMap[behavior]);
}

Game.Loader.XML.Parser.LevelParser.prototype.parse = function(levelNode, callback)
{
    var levelNode = $(levelNode),
        parser = this,
        loader = parser.loader;

    var world = new Engine.World(),
        level = new Game.scenes.Level(loader.game, world);

    this.world = world;
    this.level = level;

    if (!levelNode.is('scene[type=level]')) {
        throw new TypeError('Node not <scene type="level">');
    }

    this.node = levelNode;
    level.debug = parser.getBool(levelNode, 'debug');

    levelNode.find('> objects').each(function() {
        var objectParser = new Game.Loader.XML.Parser.ObjectParser(loader);
        parser.objects = objectParser.parse(this);
        Array.prototype.push.apply(parser.textures, objectParser.textures);
    });

    this.parseCamera(levelNode);
    this.parseGravity(levelNode);

    this.parseLayout(levelNode);

    levelNode.find('> checkpoints > checkpoint').each(function() {
        var checkpointNode = $(this);
        var c = parser.getPosition(checkpointNode);
        var r = parseFloat(checkpointNode.attr('radius'));
        level.addCheckPoint(c.x, c.y, r || undefined);
    });

    levelNode.find('> scripts > bootstrap').each(function(i, node) {
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
    });

    if (callback) {
        callback(this.level, parser);
    }
}

Game.Loader.XML.Parser.LevelParser.prototype.parseBackgrounds = function(layoutNode)
{
    var parser = this;
    var level = parser.level;

    layoutNode.find('> background').each(function() {
        backgroundNode = $(this);
        var objectId = backgroundNode.attr('model');
        if (!objectId) {
            throw new Error("Could not find object id on " + this.outerHTML);
        }
        if (!parser.objects[objectId]) {
            throw new Error("Object " + objectId + " not defined");
        }
        var constructor = parser.objects[objectId];
        var background = new constructor();

        var position = parser.getPosition(backgroundNode);
        background.position.x = position.x;
        background.position.y = position.y;
        background.position.z = position.z;

        parser.items.add({
            node: this,
            object: background,
        });

        level.world.addObject(background);
    });
}

Game.Loader.XML.Parser.LevelParser.prototype.parseCamera = function(levelNode)
{
    var level = this.level,
        parser = this;

    levelNode.find('> camera').each(function() {
        var cameraNode = $(this);
        var smoothing = parseFloat(cameraNode.attr('smoothing'));
        if (isFinite(smoothing)) {
            level.camera.smoothing = smoothing;
        }

        var posNode = cameraNode.find('> position');
        if (posNode.length) {
            var position = parser.getPosition(posNode);
            level.camera.camera.position.copy(position);
        }
    });

    levelNode.find('> camera > path').each(function() {
        var path = parser.getCameraPath(this);
        level.camera.addPath(path);
    });
}


Game.Loader.XML.Parser.LevelParser.prototype.parseGravity = function(levelNode)
{
    var level = this.level,
        parser = this;

    levelNode.find('> gravity').each(function() {
        var gravity = parser.getVector2(this);
        if (gravity) {
            level.world.gravityForce.copy(gravity);
        }
    });
}

Game.Loader.XML.Parser.LevelParser.prototype.parseLayout = function(levelNode)
{
    var parser = this,
        level = parser.level;

    var layoutNode = levelNode.find('> layout');
    this.parseBackgrounds(layoutNode);
    this.parseBehaviors(layoutNode);
    this.parseSpawners(layoutNode);

    this.parseObjectLayout(layoutNode);

    return;
}

Game.Loader.XML.Parser.LevelParser.prototype.parseObjectLayout = function(layoutNode)
{
    var parser = this,
        loader = parser.loader,
        level = parser.level;

    layoutNode.find('> objects > object').each(function() {
        var objectNode = $(this);
        var objectId = objectNode.attr('id');
        if (!parser.objects[objectId]) {
            throw new Error('Object id "' + objectId + '" not defined');
        }
        var constructor = parser.objects[objectId];

        var object = new constructor();
        var position = parser.getPosition(objectNode);
        object.position.copy(position);

        objectNode.find('> trait').each(function() {
            var traitDescriptor = parser.getTrait($(this));
            parser.applyTrait(object, traitDescriptor);
        });

        parser.items.add({
            node: this,
            object: object,
        });

        parser.world.addObject(object);
    });
}

Game.Loader.XML.Parser.LevelParser.prototype.parseBehaviors = function(layoutNode)
{
    var parser = this,
        loader = parser.loader,
        level = parser.level;

    layoutNode.find('> behaviors > *').each(function() {
        var type = this.tagName;
        $(this).find('> *').each(function() {
            var o = parser.createBehavior(this, type);
            level.world.addObject(o);
        });
    });
}

Game.Loader.XML.Parser.LevelParser.prototype.parseSpawners = function(layoutNode)
{
    var parser = this,
        level = parser.level;

    layoutNode.find(' > spawner').each(function() {
        var spawnerNode = $(this);
        var spawner = new Game.objects.Spawner();
        var position = parser.getPosition(spawnerNode);
        spawner.position.copy(position);
        spawner.position.z = -10;

        spawnerNode.find('> character').each(function() {
            var objectNode = $(this);
            var objectId = objectNode.attr('id');
            var objectRef = parser.loader.game.resource.get('character', objectId);
            if (!objectRef) {
                console.error("Character " + objectId + " not found");
                return;
            }
            spawner.pool.push(objectRef);
        });

        spawner.count = parser.getFloat(spawnerNode, 'count', Infinity);
        spawner.maxSimultaneousSpawns = parser.getFloat(spawnerNode, 'simultaneous', 1);
        spawner.interval = parser.getFloat(spawnerNode, 'interval', 5);
        spawner.minDistance = parser.getFloat(spawnerNode, 'min-distance', spawner.minDistance);
        spawner.maxDistance = parser.getFloat(spawnerNode, 'max-distance', spawner.maxDistance);

        level.world.addObject(spawner);
    });
}
