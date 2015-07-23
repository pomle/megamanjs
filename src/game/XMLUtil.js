Megaman.XMLUtil = {
    createGame: function(xmlUrl, callback)
    {
        var renderer = new THREE.WebGLRenderer({
            'antialias': false,
        });

        var game = new Megaman();
        game.engine = new Engine(renderer);

        Engine.Util.asyncLoadXml(xmlUrl, function(xml, baseUrl) {
            var gameXml = xml.children('game');

            game.player = new Megaman.Player();
            game.player.hud = new Hud($('#screen'));

            gameXml.find('> weapons > weapon').each(function() {
                var weaponXml = $(this);
                var code = weaponXml.attr('code');
                var name = weaponXml.attr('name');

                if (!Engine.assets.weapons[name]) {
                    throw new Error('Weapon ' + name + ' does not exist');
                }
                var weapon = new Engine.assets.weapons[name]();
                weapon.code = code;
                game.player.weapons[code] = weapon;
            });

            var playerXml = gameXml.children('player');
            var character = new Engine.assets.objects
                .characters[playerXml.children('character').attr('name')]();
            character.invincibilityDuration = parseFloat(playerXml.children('invincibility').attr('duration'));

            game.player.setCharacter(character);
            game.player.hud.equipCharacter(game.player.character);
            game.player.character.invincibilityDuration = 2;

            gameXml.find('> scenes > scene').each(function() {
                var sceneXml = $(this);
                game.addScene(
                    sceneXml.attr('type'),
                    sceneXml.attr('name'),
                    baseUrl + sceneXml.attr('src')
                );
            });

            game.loadScene(gameXml.find('> entrypoint > scene').attr('name'));

            callback();
        });
        return game;
    },

    createLevel: function(xmlUrl, callback)
    {
        var level = new Engine.scenes.Level();
        Engine.Util.asyncLoadXml(xmlUrl, function(xml, baseUrl) {
            var levelXml = xml.children('level');

            levelXml.children('camera').each(function() {
                var cameraXml = $(this);
                var smoothing = parseFloat(cameraXml.attr('smoothing'));
                if (isFinite(smoothing)) {
                    level.camera.smoothing = smoothing;
                }
            });

            levelXml.children('gravity').each(function() {
                var gravityXml = $(this);
                level.gravityForce.x = parseFloat(gravityXml.attr('x'));
                level.gravityForce.y = parseFloat(gravityXml.attr('y'));
            });

            var collisionRadius = undefined;
            levelXml.children('collision').each(function() {
                var collisionXml = $(this);
                var radius = parseFloat(collisionXml.attr('radius'));
                if (isFinite(radius)) {
                    level.collision.setCollisionRadius(radius);
                }
            });

            levelXml.find('> camera > path').each(function() {
                var pathXml = $(this);
                var path = new Engine.Camera.Path();
                /* y1 and y2 is swapped because they are negative. */
                var windowXml = pathXml.children('window');
                path.window[0].x = parseFloat(windowXml.attr('x1'));
                path.window[1].x = parseFloat(windowXml.attr('x2'));
                path.window[0].y = -parseFloat(windowXml.attr('y2'));
                path.window[1].y = -parseFloat(windowXml.attr('y1'));
                var constraintXml = pathXml.children('constraint');
                path.constraint[0].x = parseFloat(constraintXml.attr('x1'));
                path.constraint[1].x = parseFloat(constraintXml.attr('x2'));
                path.constraint[0].y = -parseFloat(constraintXml.attr('y2'));
                path.constraint[1].y = -parseFloat(constraintXml.attr('y1'));
                path.constraint[0].z = parseFloat(constraintXml.attr('z1')) || undefined;
                path.constraint[1].z = parseFloat(constraintXml.attr('z2')) || undefined;
                level.camera.addPath(path);
            });

            var spriteIndex = {};
            var objectIndex = {};
            var animationIndex = {};

            function expandRange(input, total)
            {
                var values = [];
                var groups, group, ranges, range, mod, upper, lower, i;

                groups = input.split(',');

                while (group = groups.shift()) {

                    mod = parseFloat(group.split('/')[1]) || 1;
                    ranges = group.split('-');

                    if (ranges.length == 2) {
                        lower = parseFloat(ranges[0]);
                        upper = parseFloat(ranges[1]);
                    }
                    else if (ranges[0] == '*') {
                        lower = 1;
                        upper = total;
                    }
                    else {
                        lower = parseFloat(ranges[0]);
                        upper = lower;
                    }

                    i = 0;
                    while (lower <= upper) {
                        if (i++ % mod === 0) {
                            values.push(lower);
                        }
                        lower++
                    }
                }

                return values;
            }

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
                xml.find('level > sprites').each(function(i, sprites) {
                    sprites = $(sprites);

                    var url = baseUrl + '/' + sprites.attr('url');
                    var size = {
                        'w': parseFloat(sprites.attr('w')),
                        'h': parseFloat(sprites.attr('h')),
                    };

                    var texture = Engine.Util.getTexture(url);
                    sprites.children('sprite').each(function(i, sprite) {
                        sprite = $(sprite);
                        var bounds = {
                            'x': parseFloat(sprite.attr('x')),
                            'y': parseFloat(sprite.attr('y')),
                            'w': parseFloat(sprite.attr('w')),
                            'h': parseFloat(sprite.attr('h')),
                        };

                        var uvMap = Engine.Util.createUVMap(bounds.x, bounds.y, bounds.w, bounds.h, size.w, size.h);
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
                        level.addTimeline(timeline);
                        animationIndex[anim.attr('name')] = {
                            "timeline": timeline,
                            "texture": texture,
                        };
                    });


                    xml.find('objects > object').each(function(i, object) {
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

            var layoutXml = levelXml.children('layout');


            var backgroundGeometry = new THREE.Geometry();
            layoutXml.find('background').each(function(i, backgroundXml) {
                backgroundXml = $(backgroundXml);
                var prop = {
                    'x': parseFloat(backgroundXml.attr('x')),
                    'y': parseFloat(backgroundXml.attr('y')),
                    'w': parseFloat(backgroundXml.attr('w')),
                    'h': parseFloat(backgroundXml.attr('h')),
                    'wx': parseFloat(backgroundXml.attr('w-segments')),
                    'hx': parseFloat(backgroundXml.attr('h-segments')),
                };
                var geometry = new THREE.PlaneGeometry(prop.w, prop.h, prop.wx, prop.hx);
                var texture;
                backgroundXml.children().each(function(i, faceXml) {
                    faceXml = $(faceXml);
                    var ref = faceXml.attr('ref');
                    if (faceXml.is('animation')) {
                        var offset = parseFloat(faceXml.attr('offset')) || 0;
                        texture = animationIndex[ref].texture;
                        var animator = new Engine.UVAnimator(animationIndex[ref].timeline, geometry, offset);
                    }
                    else if (faceXml.is('sprite')) {
                        texture = getSprite(ref).texture;
                        var uvMap = getSprite(ref).uvMap;
                    }
                    else {
                        throw new Error('Unsupported face ' + faceXml[0].localName);
                    }

                    faceXml.find('segment').each(function(i, segmentXml) {
                        segmentXml = $(segmentXml);
                        var range = {
                            'x': expandRange(segmentXml.attr('x'), prop.wx),
                            'y': expandRange(segmentXml.attr('y'), prop.hx),
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

                level.scene.add(mesh);
            });

            /* FOR MERGING
            //var levelGeometry = new THREE.Geometry();
                //mesh.updateMatrix();
                //levelGeometry.merge(mesh.geometry, mesh.matrix);
            //var levelMesh = new THREE.Mesh(levelGeometry, new THREE.MeshFaceMaterial(materials));
            //level.scene.add(levelMesh);
            */
            layoutXml.find('objects > object').each(function(i, objectXml) {
                objectXml = $(objectXml);

                var ref = objectXml.attr('ref');
                var object = getObject(ref);

                var material = new THREE.MeshBasicMaterial();
                material.map = object.texture;
                material.side = THREE.DoubleSide;

                //materials.push(spriteIndex[id].material);
                var rangeX = expandRange(objectXml.attr('x'));
                var rangeY = expandRange(objectXml.attr('y'));

                for (var i in rangeX) {
                    var mesh = new THREE.Mesh(object.geometry, material);
                    mesh.position.x = rangeX[i] + (object.size.w / 2);
                    mesh.position.y = -(rangeY[i] + (object.size.h / 2));
                    level.scene.add(mesh);
                }

                var rotate = parseFloat(objectXml.attr('rotate'));
                if (isFinite(rotate)) {
                    mesh.rotation.z = -(Math.PI/180)*rotate;
                }

                var flip = objectXml.attr('flip');
                if (flip == 'x') {
                    mesh.scale.x = -1;
                }
                if (flip == 'y') {
                    mesh.scale.y = -1;
                }
            });

            layoutXml.find('enemies > enemy').each(function(i, enemyXml) {
                enemyXml = $(enemyXml);

                var name = enemyXml.attr('name');
                if (!Engine.assets.objects.characters[name]) {
                    throw new Error('Item ' + name + ' does not exist');
                }

                var spawnXml = enemyXml.find('> spawn');
                var x = parseFloat(enemyXml.attr('x'));
                var y = -parseFloat(enemyXml.attr('y'));
                if (spawnXml.length) {
                    var object = new Engine.assets.Spawner();
                    object.spawnSource.push(Engine.assets.objects.characters[name]);
                    object.spawnCount = parseFloat(spawnXml.attr('count')) || undefined;
                    object.maxSimultaneousSpawns = parseFloat(spawnXml.attr('simultaneous')) || 1;
                    object.spawnInterval = parseFloat(spawnXml.attr('interval')) || 1;
                    object.minDistance = parseFloat(spawnXml.attr('min-distance')) || object.minDistance;
                    object.maxDistance = parseFloat(spawnXml.attr('max-distance')) || object.maxDistance;
                }
                else {
                    var object = new Engine.assets.objects.characters[name]();
                    var direction = enemyXml.attr('direction');
                    if (direction == 'right') {
                        object.setDirection(object.RIGHT);
                    }
                    else if (direction == 'left') {
                        object.setDirection(object.LEFT);
                    }
                }

                level.addObject(object, x, y);
            });

            layoutXml.find('> items > item').each(function() {
                var itemXml = $(this);
                var name = itemXml.attr('name');
                if (!Engine.assets.objects.items[name]) {
                    throw new Error('Item ' + name + ' does not exist');
                }
                var Item = new Engine.assets.objects.items[name]();
                Item.model.position.x = parseFloat(itemXml.attr('x'));
                Item.model.position.y = -parseFloat(itemXml.attr('y'));
                level.addObject(Item);
            });

            layoutXml.find('obstacles > obstacle').each(function(i, obstacleXml) {
                obstacleXml = $(obstacleXml);
                var name = obstacleXml.attr('name');
                if (!Engine.assets.obstacles[name]) {
                    throw new Error('Obstacle ' + name + ' does not exist');
                }
                if (name == 'DestructibleWall') {
                    var obstacle = new Engine.assets.obstacles[name](obstacleXml.attr('color'));
                    obstacle.model.position.x = parseFloat(obstacleXml.attr('x'));
                    obstacle.model.position.y = -parseFloat(obstacleXml.attr('y'));
                }
                else if (name == 'DeathZone') {
                    var obstacle = new Engine.assets.obstacles[name]();
                    var prop = {
                        'x': parseFloat(obstacleXml.attr('x')),
                        'y': parseFloat(obstacleXml.attr('y')),
                        'w': parseFloat(obstacleXml.attr('w')),
                        'h': parseFloat(obstacleXml.attr('h')),
                    };
                    obstacle.addCollisionRect(prop.w, prop.h);
                    obstacle.model.position.x = prop.x + (prop.w/2);
                    obstacle.model.position.y = -(prop.y + (prop.h/2));
                }
                else {
                    var obstacle = new Engine.assets.obstacles[name]();
                    var ref = obstacleXml.attr('ref');
                    var object = getObject(ref);
                    var material = new THREE.MeshBasicMaterial();
                    material.map = object.texture;
                    material.side = THREE.DoubleSide;
                    var model = new THREE.Mesh(object.geometry, material);
                    obstacle.setModel(model);
                    obstacle.addCollisionRect(object.size.w, object.size.h);
                    obstacle.model.position.x = parseFloat(obstacleXml.attr('x'));
                    obstacle.model.position.y = -parseFloat(obstacleXml.attr('y'));
                }

                level.addObject(obstacle);
            });

            levelXml.find('> layout > solids').each(function() {
                var solidsXml = $(this);
                var expose = (solidsXml.attr('expose') == 'true');

                var material = new THREE.MeshBasicMaterial({
                    color: 'white',
                    wireframe: true,
                    visible: expose,
                });

                solidsXml.children().each(function(i, solidXml) {
                    solidXml = $(solidXml);
                    var prop = {
                        'x': parseFloat(solidXml.attr('x')),
                        'y': parseFloat(solidXml.attr('y')),
                        'w': parseFloat(solidXml.attr('w')),
                        'h': parseFloat(solidXml.attr('h')),
                    }

                    var c2 = collisionRadius * 2;
                    if (prop.w > c2 || prop.h > c2) {
                        console.error('Solid beyond collision radius %f.', collisionRadius, prop);
                    }

                    var geometry = new THREE.PlaneGeometry(prop.w, prop.h);

                    var solid = new Engine.assets.Solid();
                    solid.position.x = prop.x + (prop.w / 2);
                    solid.position.y = -(prop.y + (prop.h / 2));
                    solid.addCollisionGeometry(geometry);

                    var attackXmls = solidXml.find('> attack');
                    if (attackXmls.length) {
                        solid.attackAccept = [];
                        attackXmls.each(function(i, attackXml) {
                            var direction = $(attackXml).attr('direction');
                            solid.attackAccept.push(solid[direction.toUpperCase()]);
                        });
                    }

                    level.addObject(solid);
                });
            });

            levelXml.find('> checkpoints > checkpoint').each(function() {
                var checkpointXml = $(this);
                var x = parseFloat(checkpointXml.attr('x'));
                var y = parseFloat(checkpointXml.attr('y'));
                var r = parseFloat(checkpointXml.attr('radius'));
                level.addCheckPoint(x, -y, r || undefined);
            });

            callback();
        });

        return level;
    },

    createStageSelect: function(xmlUrl, callback)
    {
        var scene = new Engine.scenes.StageSelect();
        Engine.Util.asyncLoadXml(xmlUrl, function(xml, baseUrl) {
            var sceneXml = xml.children('stage-select');

            var spriteUrl = sceneXml.attr('url');
            var spriteW = parseFloat(sceneXml.attr('w'));
            var spriteH = parseFloat(sceneXml.attr('h'));

            var backgroundXml = sceneXml.children('background');
            scene.setBackgroundColor(backgroundXml.attr('color'));

            var indicatorXml = sceneXml.children('indicator');
            scene.setIndicator(Engine.SpriteManager.createSingleTile(
                spriteUrl,
                parseFloat(indicatorXml.attr('w')), parseFloat(indicatorXml.attr('h')),
                parseFloat(indicatorXml.attr('x')), parseFloat(indicatorXml.attr('y')),
                spriteW, spriteH));

            var frameXml = sceneXml.children('frame');
            scene.setFrame(Engine.SpriteManager.createSingleTile(
                spriteUrl,
                parseFloat(frameXml.attr('w')), parseFloat(frameXml.attr('h')),
                parseFloat(frameXml.attr('x')), parseFloat(frameXml.attr('y')),
                spriteW, spriteH));

            sceneXml.find('> stage').each(function() {
                var stageXml = $(this);
                var avatar = Engine.SpriteManager.createSingleTile(
                    spriteUrl,
                    parseFloat(stageXml.attr('w')), parseFloat(stageXml.attr('h')),
                    parseFloat(stageXml.attr('x')), parseFloat(stageXml.attr('y')),
                    spriteW, spriteH);
                var index = parseFloat(stageXml.attr('index'));
                var name = stageXml.attr('name');
                var caption = stageXml.attr('caption');
                scene.addStage(avatar, caption, name);
            });

            scene.equalize();
            callback();
        });
        return scene;
    }
}
