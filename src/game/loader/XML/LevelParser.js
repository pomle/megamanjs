/**
 * All Y values are negated to avoid having to specify
 * everything in XML as negative.
 */
Game.Loader.XML.Parser.LevelParser = function(loader)
{
    Game.Loader.XML.Parser.call(this, loader);
    var world = new Engine.World();
    this.world = world;
    this.level = new Game.scenes.Level(loader.game, this.world);

    this.objects = {};
}

Engine.Util.extend(Game.Loader.XML.Parser.LevelParser, Game.Loader.XML.Parser);

Game.Loader.XML.Parser.LevelParser.prototype.parse = function(levelNode)
{
    if (!levelNode.is('scene[type=level]')) {
        throw new TypeError('Node not <scene type="level">');
    }

    var parser = this;
    var loader = parser.loader;
    var level = this.level;

    level.debug = parser.getBool(levelNode, 'debug');

    levelNode.find('> objects').each(function() {
        var objectParser = new Game.Loader.XML.Parser.ObjectParser(loader);
        parser.objects = objectParser.parse($(this));
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

    this.callback(this.level);
}

Game.Loader.XML.Parser.LevelParser.prototype.parseBackgrounds = function(layoutNode)
{
    var parser = this;
    var level = parser.level;
    layoutNode.find('> background').each(function() {
        backgroundNode = $(this);
        var objectId = backgroundNode.attr('model');
        var background = new parser.objects[objectId]();

        var position = parser.getPosition(backgroundNode);
        background.position.x = position.x - background.origo.x;
        background.position.y = position.y - background.origo.y;
        if (position.z !== undefined) {
            background.position.z = position.z -.1;
        }

        level.world.addObject(background);
    });
}

Game.Loader.XML.Parser.LevelParser.prototype.parseCamera = function(levelNode)
{
    var z = 150;

    var level = this.level;
    var parser = this;

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
        var pathNode = $(this);
        var path = new Engine.Camera.Path();
        /* y1 and y2 is swapped because they are converted to negative values and
           y2 should always be bigger than y1. */
        var windowNode = pathNode.children('window');
        path.window[0] = parser.getPosition(windowNode, 'x1', 'y2');
        path.window[1] = parser.getPosition(windowNode, 'x2', 'y1');

        var constraintNode = pathNode.children('constraint');
        path.constraint[0] = parser.getPosition(constraintNode, 'x1', 'y2', 'z');
        path.constraint[1] = parser.getPosition(constraintNode, 'x2', 'y1', 'z');
        path.constraint[0].z = z;
        path.constraint[1].z = z;

        level.camera.addPath(path);
    });
}

Game.Loader.XML.Parser.LevelParser.prototype.parseGravity = function(levelNode)
{
    var level = this.level;
    var parser = this;
    levelNode.find('> gravity').each(function() {
        var gravity = parser.getVector2(this);
        if (gravity) {
            level.world.gravityForce.copy(gravity);
        }
    });
}

Game.Loader.XML.Parser.LevelParser.prototype.parseLayout = function(levelNode)
{
    var parser = this;
    var level = parser.level;

    var layoutNode = levelNode.find('> layout');
    this.parseBackgrounds(layoutNode);
    this.parseBehaviors(layoutNode);
    this.parseSpawners(layoutNode);

    this.parseObjectLayout(layoutNode);

    return;
}

Game.Loader.XML.Parser.LevelParser.prototype.parseObjectLayout = function(layoutNode)
{
    var parser = this;
    var loader = parser.loader;
    var level = parser.level;

    layoutNode.find('> objects > object').each(function() {
        var objectNode = $(this);
        var objectId = objectNode.attr('id');
        if (!parser.objects[objectId]) {
            throw new Error('Object id "' + objectId + '" not defined');
        }

        var object = new parser.objects[objectId]();
        var position = parser.getPosition(objectNode);
        position.sub(object.origo);
        object.moveTo(position);
        object.position.z = -.1;

        objectNode.find('> trait').each(function() {
            var traitDescriptor = parser.getTrait($(this));
            loader.applyTrait(object, traitDescriptor);
        });

        parser.world.addObject(object);
    });
}

Game.Loader.XML.Parser.LevelParser.prototype.parseBehaviors = function(layoutNode)
{
    var parser = this;
    var loader = parser.loader;
    var level = parser.level;

    function createObject(node, ref)
    {
        node = $(node);
        var rect = parser.getRect(node);
        var object = new ref();
        object.position.x = rect.x + (rect.w / 2);
        object.position.y = -(rect.y + (rect.h / 2));
        object.position.z = -10;
        object.addCollisionRect(rect.w, rect.h);

        node.find('> trait').each(function() {
            var traitDescriptor = parser.getTrait($(this));
            loader.applyTrait(object, traitDescriptor);
        });

        return object;
    }

    layoutNode.find('deathzones > *').each(function() {
        var d = createObject(this, Game.objects.obstacles.DeathZone);
        level.world.addObject(d);
    });

    layoutNode.find('environments > *').each(function() {
        var e = createObject(this, Engine.Object);
        level.world.addObject(e);
    });

    layoutNode.find('solids > *').each(function() {
        var s = createObject(this, Game.objects.Solid);
        level.world.addObject(s);
    });

    layoutNode.find('climbables > *').each(function() {
        var c = createObject(this, Game.objects.Climbable);
        level.world.addObject(c);
    });
}

Game.Loader.XML.Parser.LevelParser.prototype.parseSpawners = function(layoutNode)
{
    var parser = this;
    var level = parser.level;

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
                throw new Error("Character " + objectId + " not found");
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
