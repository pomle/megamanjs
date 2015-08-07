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
    this.faceAnimators = {};
    this.models = {};
}

Engine.Util.extend(Game.Loader.XML.Parser.LevelParser, Game.Loader.XML.Parser);

Game.Loader.XML.Parser.LevelParser.prototype.parse = function(levelNode, callback)
{
    if (!levelNode.is('scene[type=level]')) {
        throw new TypeError('Node not <scene type="level">');
    }

    var parser = this;
    var loader = parser.loader;
    var level = this.level;

    this.parseCamera(levelNode);
    this.parseGravity(levelNode);

    levelNode.find('> texture').each(function() {
        var node = $(this);
        parser.parseTexture(node);
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

Game.Loader.XML.Parser.LevelParser.prototype.parseBackgrounds = function(levelNode)
{
    var parser = this;
    var level = parser.level;
    levelNode.find('> layout > background').each(function() {
        backgroundNode = $(this);
        var modelId = backgroundNode.attr('model');

        var background = new parser.models[modelId]();

        var position = parser.getVector2(backgroundNode);
        background.position.x = position.x + (background._size.x / 2);
        background.position.y = position.y - (background._size.y / 2);
        background.position.z = 0;

        level.world.addObject(background);
    });
}

Game.Loader.XML.Parser.LevelParser.prototype.parseCamera = function(levelNode)
{
    var level = this.level;
    var parser = this;

    levelNode.find('> camera').each(function() {
        var cameraNode = $(this);
        var smoothing = parseFloat(cameraNode.attr('smoothing'));
        if (isFinite(smoothing)) {
            level.camera.smoothing = smoothing;
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

    this.parseBackgrounds(levelNode);

    this.parseSolids(levelNode);

    return;

    layoutNode.find('enemies > enemy').each(function(i, enemyNode) {
        enemyNode = $(enemyNode);

        var id = enemyNode.attr('id');
        if (loader.game.resource.items.character[id]) {
            objectRef = loader.game.resource.items.character[id];
        }
        else {
            var name = enemyNode.attr('name');
            if (!Game.objects.characters[name]) {
                throw new Error('Item ' + name + ' does not exist');
            }
            objectRef = Game.objects.characters[name];
        }

        var spawnNode = enemyNode.find('> spawn');
        var x = parseFloat(enemyNode.attr('x'));
        var y = -parseFloat(enemyNode.attr('y'));
        if (spawnNode.length) {
            var object = new Game.objects.Spawner();
            object.spawnSource.push(objectRef);
            object.spawnCount = parseFloat(spawnNode.attr('count')) || undefined;
            object.maxSimultaneousSpawns = parseFloat(spawnNode.attr('simultaneous')) || 1;
            object.spawnInterval = parseFloat(spawnNode.attr('interval')) || 1;
            object.minDistance = parseFloat(spawnNode.attr('min-distance')) || object.minDistance;
            object.maxDistance = parseFloat(spawnNode.attr('max-distance')) || object.maxDistance;
        }
        else {
            var object = new objectRef();
            var direction = enemyNode.attr('direction');
            if (direction == 'right') {
                object.direction.x = object.DIRECTION_RIGHT;
            }
            else if (direction == 'left') {
                object.direction.x = object.DIRECTION_LEFT;
            }
        }

        level.world.addObject(object, x, y);
    });

    layoutNode.find('> items > item').each(function() {
        var itemNode = $(this);
        var name = itemNode.attr('name');
        if (!Game.objects.items[name]) {
            throw new Error('Item ' + name + ' does not exist');
        }
        var Item = new Game.objects.items[name]();
        Item.model.position.x = parseFloat(itemNode.attr('x'));
        Item.model.position.y = -parseFloat(itemNode.attr('y'));
        scene.addObject(Item);
    });

    layoutNode.find('obstacles > obstacle').each(function(i, obstacleNode) {
        obstacleNode = $(obstacleNode);
        var name = obstacleNode.attr('name');
        if (!Game.objects.obstacles[name]) {
            throw new Error('Obstacle ' + name + ' does not exist');
        }
        if (name == 'DestructibleWall') {
            var obstacle = new Game.objects.obstacles[name](obstacleNode.attr('color'));
            obstacle.model.position.x = parseFloat(obstacleNode.attr('x'));
            obstacle.model.position.y = -parseFloat(obstacleNode.attr('y'));
        }
        else if (name == 'DeathZone') {
            var obstacle = new Game.objects.obstacles[name]();
            var prop = {
                'x': parseFloat(obstacleNode.attr('x')),
                'y': parseFloat(obstacleNode.attr('y')),
                'w': parseFloat(obstacleNode.attr('w')),
                'h': parseFloat(obstacleNode.attr('h')),
            };
            obstacle.addCollisionRect(prop.w, prop.h);
            obstacle.model.position.x = prop.x + (prop.w/2);
            obstacle.model.position.y = -(prop.y + (prop.h/2));
        }
        else {
            var obstacle = new Game.objects.obstacles[name]();
            var ref = obstacleNode.attr('ref');
            var object = getObject(ref);
            var material = new THREE.MeshBasicMaterial();
            material.map = object.texture;
            material.side = THREE.DoubleSide;
            var model = new THREE.Mesh(object.geometry, material);
            obstacle.setModel(model);
            obstacle.addCollisionRect(object.size.w, object.size.h);
            obstacle.model.position.x = parseFloat(obstacleNode.attr('x'));
            obstacle.model.position.y = -parseFloat(obstacleNode.attr('y'));
        }

        level.world.addObject(obstacle);
    });

    /* FOR MERGING
    //var levelGeometry = new THREE.Geometry();
        //mesh.updateMatrix();
        //levelGeometry.merge(mesh.geometry, mesh.matrix);
    //var levelMesh = new THREE.Mesh(levelGeometry, new THREE.MeshFaceMaterial(materials));
    //level.level.add(levelMesh);
    */
    layoutNode.find('objects > object').each(function(i, objectNode) {
        objectNode = $(objectNode);

        var ref = objectNode.attr('ref');
        var object = getObject(ref);

        var material = new THREE.MeshBasicMaterial();
        material.map = object.texture;
        material.side = THREE.DoubleSide;

        //materials.push(spriteIndex[id].material);
        var rangeX = parser.getRange(objectNode, 'x');
        var rangeY = parser.getRange(objectNode, 'y');

        for (var i in rangeX) {
            var mesh = new THREE.Mesh(object.geometry, material);
            mesh.position.x = rangeX[i] + (object.size.w / 2);
            mesh.position.y = -(rangeY[i] + (object.size.h / 2));
            level.world.scene.add(mesh);
        }

        var rotate = parseFloat(objectNode.attr('rotate'));
        if (isFinite(rotate)) {
            mesh.rotation.z = -(Math.PI/180)*rotate;
        }

        var flip = objectNode.attr('flip');
        if (flip == 'x') {
            mesh.scale.x = -1;
        }
        if (flip == 'y') {
            mesh.scale.y = -1;
        }
    });
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

Game.Loader.XML.Parser.LevelParser.prototype.parseSolids = function(levelNode)
{
    var parser = this;
    var level = parser.level;

    var material = new THREE.MeshBasicMaterial({
        color: 'white',
        wireframe: true,
        visible: false,
    });

    levelNode.find('> layout > solids > *').each(function() {
        solidNode = $(this);
        var rect = parser.getRect(solidNode);

        var geometry = new THREE.PlaneGeometry(rect.w, rect.h);

        var solid = new Game.objects.Solid();
        solid.position.x = rect.x + (rect.w / 2);
        solid.position.y = -(rect.y + (rect.h / 2));
        solid.addCollisionGeometry(geometry);

        var attackNodes = solidNode.find('> attack');
        if (attackNodes.length) {
            solid.attackAccept = [];
            attackNodes.each(function(i, attackNode) {
                var direction = $(attackNode).attr('direction');
                solid.attackAccept.push(solid[direction.toUpperCase()]);
            });
        }

        level.world.addObject(solid);
    });
}

Game.Loader.XML.Parser.LevelParser.prototype.parseTexture = function(textureNode)
{
    var parser = this;
    var textureSize = parser.getVector2(textureNode, 'w', 'h');
    var texture = parser.getTexture(textureNode);

    textureNode.find('animation').each(function() {
        var animationNode = $(this);
        var animation = new Engine.Animator.Animation();
        animationNode.find('> frame').each(function() {
            var frameNode = $(this);
            var frameOffset = parser.getVector2(frameNode, 'x', 'y');
            var frameSize = parser.getVector2(frameNode, 'w', 'h');

            var uvMap = Engine.SpriteManager.createUVMap(frameOffset.x, frameOffset.y,
                                                         frameSize.x,   frameSize.y,
                                                         textureSize.x, textureSize.y);

            var duration = parseFloat(frameNode.attr('duration')) || undefined;
            animation.addFrame(uvMap, duration);
        });
        parser.animations[animationNode.attr('id')] = {
            'animation': animation,
            'texture': texture,
            'mounted': false,
        }
    });
}
