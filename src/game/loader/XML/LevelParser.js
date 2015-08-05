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
}

Engine.Util.extend(Game.Loader.XML.Parser.LevelParser, Game.Loader.XML.Parser);

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
        /* y1 and y2 is swapped because they are negative. */
        var windowNode = pathNode.children('window');
        path.window = parser.getRect(windowNode);

        var constraintNode = pathNode.children('constraint');
        path.constraint[0] = parser.getVector3(constraintNode, 'x1', 'y1', 'z1');
        path.constraint[1] = parser.getVector3(constraintNode, 'x2', 'y2', 'z2');

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
            gravity.y = -gravity.y;
            level.world.gravityForce.copy(gravity);
        }
    });
}

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

    var spriteIndex = {};
    var objectIndex = {};
    var animationIndex = {};


    function getObject(ref)
    {
        if (!objectIndex[ref]) {
            throw new Error("No object reference '" + ref + "'");
        }
        return objectIndex[ref];
    }

    function getSprite(ref)
    {
        if (!spriteIndex[ref]) {
            throw new Error("No sprite '" + ref + "'");
        }
        return spriteIndex[ref];
    }

    function createObjects() {
        levelNode.find('> sprites').each(function(i, sprites) {
            sprites = $(sprites);

            var url = levelNode.baseUrl + sprites.attr('url');
            var size = {
                'w': parseFloat(sprites.attr('w')),
                'h': parseFloat(sprites.attr('h')),
            };

            var texture = Engine.TextureManager.getTexture(url);
            sprites.children('sprite').each(function(i, sprite) {
                sprite = $(sprite);
                var bounds = {
                    'x': parseFloat(sprite.attr('x')),
                    'y': parseFloat(sprite.attr('y')),
                    'w': parseFloat(sprite.attr('w')),
                    'h': parseFloat(sprite.attr('h')),
                };

                var uvMap = Engine.SpriteManager.createUVMap(bounds.x, bounds.y, bounds.w, bounds.h, size.w, size.h);
                spriteIndex[sprite.attr('id')] = {
                    'uvMap': uvMap,
                    'texture': texture,
                }
            });

            sprites.children('animation').each(function(i, anim) {
                anim = $(anim);
                var timeline = new Engine.Timeline();
                timeline.name = anim.attr('name');
                anim.children('frame').each(function(i, frame) {
                    frame = $(frame);
                    timeline.addFrame(getSprite(frame.attr('sprite')).uvMap, parseFloat(frame.attr('duration')));
                });
                level.world.addTimeline(timeline);
                animationIndex[anim.attr('name')] = {
                    "timeline": timeline,
                    "texture": texture,
                };
            });


            levelNode.find('objects > object').each(function(i, object) {
                object = $(object);
                var objectId = object.attr('id');
                var size = {
                    'w': parseFloat(object.attr('w')),
                    'h': parseFloat(object.attr('h')),
                    'wseg': parseFloat(object.attr('segments-w')) || 1,
                    'hseg': parseFloat(object.attr('segments-h')) || 1,
                };

                var geometry = new THREE.PlaneGeometry(size.w, size.h, size.wseg, size.hseg);

                object.children().each(function(i, face) {
                    face = $(face);
                    var ref = face.attr('ref');
                    if (face.is('animation')) {
                        var offset = parseFloat(face.attr('offset')) || 0;
                        var animator = new Engine.UVAnimator(animationIndex[ref].timeline, geometry, offset);
                        animator.addFaceIndex(i*2);
                    }
                    else if (face.is('sprite')) {
                        geometry.faceVertexUvs[i] = getSprite(ref).uvMap;
                    }
                    else if (face.is('empty')) {

                    }
                    else {
                        throw new Error('Unsupported face ' + face[0].localName);
                    }
                });

                objectIndex[objectId] = {
                    'size': size,
                    'geometry': geometry,
                    'texture': texture
                };
            });
        });
    }

    createObjects();

    var layoutNode = levelNode.children('layout');


    var backgroundGeometry = new THREE.Geometry();
    layoutNode.find('background').each(function(i, backgroundNode) {
        backgroundNode = $(backgroundNode);
        var prop = {
            'x': parseFloat(backgroundNode.attr('x')),
            'y': parseFloat(backgroundNode.attr('y')),
            'w': parseFloat(backgroundNode.attr('w')),
            'h': parseFloat(backgroundNode.attr('h')),
            'wx': parseFloat(backgroundNode.attr('w-segments')),
            'hx': parseFloat(backgroundNode.attr('h-segments')),
        };
        var geometry = new THREE.PlaneGeometry(prop.w, prop.h, prop.wx, prop.hx);
        var texture;
        backgroundNode.children().each(function(i, faceNode) {
            faceNode = $(faceNode);
            var ref = faceNode.attr('ref');
            if (faceNode.is('animation')) {
                var offset = parseFloat(faceNode.attr('offset')) || 0;
                texture = animationIndex[ref].texture;
                var animator = new Engine.UVAnimator(animationIndex[ref].timeline, geometry, offset);
            }
            else if (faceNode.is('sprite')) {
                texture = getSprite(ref).texture;
                var uvMap = getSprite(ref).uvMap;
            }
            else {
                throw new Error('Unsupported face ' + faceNode[0].localName);
            }

            faceNode.find('segment').each(function(i, segmentNode) {
                segmentNode = $(segmentNode);
                var range = {
                    'x': parser.getRange(segmentNode, 'x', prop.wx),
                    'y': parser.getRange(segmentNode, 'y', prop.hx),
                };

                var i, j, x, y, faceIndex;
                for (i in range.x) {
                    x = range.x[i] - 1;
                    for (j in range.y) {
                        y = range.y[j] - 1;
                        faceIndex = (x + (y * prop.wx)) * 2;
                        if (animator) {
                            animator.addFaceIndex(faceIndex);
                        }
                        else {
                            geometry.faceVertexUvs[0][faceIndex] = uvMap[0];
                            geometry.faceVertexUvs[0][faceIndex+1] = uvMap[1];
                        }
                    }
                }
            });
        });

        var material = new THREE.MeshBasicMaterial({
            map: texture,
            side: THREE.FrontSide,
        });

        var mesh = new THREE.Mesh(geometry, material);
        mesh.position.x = prop.x + (prop.w / 2);
        mesh.position.y = -(prop.y + (prop.h / 2));
        mesh.position.z = 0;

        level.world.scene.add(mesh);
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

    levelNode.find('> layout > solids').each(function() {
        var solidsNode = $(this);
        var expose = (solidsNode.attr('expose') == 'true');

        var material = new THREE.MeshBasicMaterial({
            color: 'white',
            wireframe: true,
            visible: expose,
        });

        solidsNode.children().each(function(i, solidNode) {
            solidNode = $(solidNode);
            var prop = {
                'x': parseFloat(solidNode.attr('x')),
                'y': parseFloat(solidNode.attr('y')),
                'w': parseFloat(solidNode.attr('w')),
                'h': parseFloat(solidNode.attr('h')),
            }

            /* Put code to calculated collisionradius needed somehow here
            var c2 = collisionRadius * 2;
            if (prop.w > c2 || prop.h > c2) {
                console.error('Solid beyond collision radius %f.', collisionRadius, prop);
            }
            */

            var geometry = new THREE.PlaneGeometry(prop.w, prop.h);

            var solid = new Game.objects.Solid();
            solid.position.x = prop.x + (prop.w / 2);
            solid.position.y = -(prop.y + (prop.h / 2));
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
    });

    levelNode.find('> checkpoints > checkpoint').each(function() {
        var checkpointNode = $(this);
        var x = parseFloat(checkpointNode.attr('x'));
        var y = parseFloat(checkpointNode.attr('y'));
        var r = parseFloat(checkpointNode.attr('radius'));
        level.addCheckPoint(x, -y, r || undefined);
    });

    this.callback(this.level);
}
