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

    this.animations = {};
    this.models = {};
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

    this.parseCamera(levelNode);
    this.parseGravity(levelNode);

    levelNode.find('> texture').each(function() {
        var node = $(this);
        parser.parseTexture(node);
    });

    levelNode.find('> objects > object').each(function() {
        var objectNode = $(this);
        var objectId = objectNode.attr('id');
        if (parser.objects[objectId]) {
            throw new Error('Object id "' + objectId + '" already defined');
        }

        var object = parser.getObject(objectNode);
        parser.objects[objectId] = object;
    });

    levelNode.find('> models > model').each(function() {
        parser.parseModel($(this));
    });

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
        var modelId = backgroundNode.attr('model');

        var background = new parser.models[modelId]();

        var position = parser.getPosition(backgroundNode);
        background.position.x = position.x + (background._size.x / 2);
        background.position.y = position.y - (background._size.y / 2);
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

Game.Loader.XML.Parser.LevelParser.prototype.parseModel = function(modelNode)
{
    var parser = this;
    var world = parser.level.world;

    var modelId = modelNode.attr('id');
    var geometryNode = modelNode.find('> geometry');
    var geometry = parser.getGeometry(geometryNode);
    geometryNode._modelId = modelId;
    var size = parser.getVector2(geometryNode, 'w', 'h');
    var segs = parser.getVector2(geometryNode, 'w-segments', 'h-segments');

    var textures = [];
    var animators = {};

    modelNode.find('> tile').each(function() {
        var tileNode = $(this);
        var animationId = tileNode.attr('id');
        if (!parser.animations[animationId]) {
            throw new Error('Animation "' + animationId + '" not defined');
        }

        var animation = parser.animations[animationId].animation;
        var offset = parseFloat(tileNode.attr('offset')) || 0;

        tileNode.find('> face').each(function() {
            var faceNode = $(this);

            if (!animators[animationId]) {
                var animator = new Engine.Animator.UV();
                animator._modelId = modelId;
                animator._animationId = animationId;
                animator.indices = [];
                animator.update = animator.update.bind(animator);
                animator.setAnimation(animation);
                animator.addGeometry(geometry);
                if (animation.frames > 1) {
                    var world = parser.level.world;

                    /* If animation contains multiple frames, bind
                       update function to worlds update event.

                       Perhaps it is better to bind this in the constructor
                       so that every model is concerned only by itself.

                       However, then we must clone the animator to avoid
                       increasing the time for every object.
                    */
                    world.events.bind(world.EVENT_UPDATE, animator.update);
                }
                animators[animationId] = animator;
            }
            else {
                var animator = animators[animationId];
            }

            textures.push(parser.animations[animationId].texture);


            var range = {
                'x': parser.getRange(faceNode, 'x', segs.x),
                'y': parser.getRange(faceNode, 'y', segs.y),
            };

            var i, j, x, y, faceIndex;
            for (i in range.x) {
                x = range.x[i] - 1;
                for (j in range.y) {
                    y = range.y[j] - 1;
                    /* The face index is the first of the two triangles that make up a rectangular
                       face. The Animator.UV will set the UV map to the faceIndex and faceIndex+1.
                       Since we expect to paint two triangles at every index we need to 2x the index
                       count so that we skip two faces for every index jump. */
                    faceIndex = (x + (y * segs.x)) * 2;
                    animator.indices.push(faceIndex);
                }
            }
        });
    });

    if (!textures[0]) {
        throw new Error("No texture index 0 for model " + modelId);
    }

    /* Run initial update of all UV maps. */
    for (var animationId in animators) {
        animators[animationId].update();
    }

    var material = new THREE.MeshBasicMaterial({
        map: textures[0],
        side: THREE.FrontSide,
        transparent: true,
    });

    var object = function()
    {
        this._modelId = modelId;
        this._size = size;

        this.geometry = geometry;
        this.material = material;

        Engine.Object.call(this);
    }

    Engine.Util.extend(object, Engine.Object);

    this.models[modelId] = object;
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
