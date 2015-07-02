var Megaman = function()
{
    this.engine = undefined;
    this.player = undefined;

    this.scenes = {};

    this.level = undefined;

    window.addEventListener('focus', function() {
        if (this.engine && !this.engine.isRunning) {
            this.engine.run();
        }
    }.bind(this));
    window.addEventListener('blur', function() {
        if (this.engine && this.engine.isRunning) {
            this.engine.pause();
        }
    }.bind(this));
}

Megaman.prototype.addScene = function(type, name, src)
{
    this.scenes[name] = {
        type: type,
        name: name,
        src: src,
    };
}

Megaman.createGame = function(xmlUrl, callback)
{
    var renderer = new THREE.WebGLRenderer();
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
}

Megaman.prototype.attachToElement = function(element)
{
    this.element = element;
    this.adjustSize();
    this.element.appendChild(this.engine.renderer.domElement);
}

Megaman.prototype.adjustCamera = function()
{
    if (this.engine.scene) {
        var rect = this.element.getBoundingClientRect();
        var cam = this.engine.scene.camera.camera;
        cam.aspect = rect.width / rect.height;
        cam.updateProjectionMatrix();
    }
}

Megaman.prototype.adjustSize = function()
{
    if (!this.element) {
        throw new Error("No element");
    }
    var rect = this.element.getBoundingClientRect();
    this.engine.renderer.setSize(rect.width, rect.height);
    this.adjustCamera();
}

Megaman.prototype.createScene = function(type, xmlUrl)
{
    var scene;
    var callback = function() {
        this.setScene(scene);
    }.bind(this);

    switch (type) {
        case 'level':
            scene = this.createLevel(xmlUrl, callback);
            break;
        case 'stage-select':
            scene = this.createStageSelect(xmlUrl, callback);
            break;
    }
}

Megaman.prototype.createStageSelect = function(xmlUrl, callback)
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


Megaman.prototype.createLevel = function(xmlUrl, callback)
{
    var level = new Engine.scenes.Level();
    Engine.Util.asyncLoadXml(xmlUrl, function(xml, baseUrl) {
        var levelXml = xml.children('level');

        level.animators = [];

        levelXml.children('gravity').each(function() {
            var gravityXml = $(this);
            level.gravityForce.x = parseFloat(gravityXml.attr('x'));
            level.gravityForce.y = parseFloat(gravityXml.attr('y'));
        });

        var collisionRadius = undefined;
        levelXml.children('collision-radius').each(function() {
            var colXml = $(this);
            collisionRadius = parseFloat(colXml.attr('units'));
            level.collision.setCollisionRadius(collisionRadius);
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

        level.enemies = [];
        layoutXml.find('enemies > enemy').each(function(i, enemyXml) {
            enemyXml = $(enemyXml);

            var name = enemyXml.attr('name');
            if (!Engine.assets.objects.characters[name]) {
                throw new Error('Item ' + name + ' does not exist');
            }
            var enemy = new Engine.assets.objects.characters[name]();
            var x = parseFloat(enemyXml.attr('x'));
            var y = -parseFloat(enemyXml.attr('y'));

            var direction = enemyXml.attr('direction');
            if (direction == 'right') {
                enemy.setDirection(enemy.RIGHT);
            }
            else if (direction == 'left') {
                enemy.setDirection(enemy.LEFT);
            }

            level.addObject(enemy, x, y);
            level.enemies.push(enemy);
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

            solidsXml.children().each(function() {
                var solidXml = $(this);
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
                var mesh = new THREE.Mesh(geometry, material);
                mesh.position.x = prop.x + (prop.w / 2);
                mesh.position.y = -(prop.y + (prop.h / 2));
                mesh.position.z = expose ? 1 : -1;

                var solid = new Engine.assets.Solid();
                solid.setModel(mesh);
                solid.addCollisionGeometry(geometry);

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
}

Megaman.prototype.loadScene = function(name)
{
    if (!this.scenes[name]) {
        throw new Error("Scene " + name + " not defined");
    }

    return this.createScene(this.scenes[name].type, this.scenes[name].src);
}

Megaman.prototype.setScene = function(scene)
{
    if (scene instanceof Engine.Scene === false) {
        throw new Error('Invalid scene');
    }
    this.engine.pause();

    if (this.engine.scene) {
        this.engine.scene.__destroy();
    }

    scene.exit = function(name) {
        this.loadScene(name);
    }.bind(this);

    var start;
    if (scene instanceof Engine.scenes.Level) {
        this.level = new Megaman.LevelRunner(this, scene);
        start = function() {
            this.level.startGamePlay();
        }.bind(this)
    }
    else {
        this.engine.scene = scene;
        start = function() {
            this.engine.run();
        }.bind(this);
    }

    this.adjustCamera();

    /*
        For some reason, if we start the engine immediately,
        the performance is sluggish. Deferring it to end of call queue
        fixes it.
    */
    setTimeout(start, 0);
}

Megaman.Player = function()
{
    this.character = undefined;
    this.hud = undefined;
    this.input = undefined;
    this.lifes = 3;
    this.weapons = {};
}

Megaman.Player.prototype.equipWeapon = function(code)
{
    var weapon = this.weapons[code];
    weapon.code = code;
    this.character.equipWeapon(weapon);
    this.hud.equipWeapon(weapon);
}

Megaman.Player.prototype.setCharacter = function(character)
{
    this.character = character;
}

Megaman.LevelRunner = function(game, level)
{
    if (game instanceof Megaman === false) {
        throw new Error('Invalid game');
    }
    if (level instanceof Engine.scenes.Level === false) {
        throw new Error('Invalid level');
    }


    this.assets = {
        "ready": Engine.Util.createTextSprite("READY"),
    };


    this.cameraFollowOffset = new THREE.Vector2(0, 25);
    this.checkPointIndex = 0;
    this.checkPointOffset = new THREE.Vector2(0, 200);
    this.game = game;
    this.level = level;

    this.inputs = {
        character: this.createCharacterInput(),
        menu: this.createMenuInput(),
    };

    this.game.engine.scene = this.level;

    this.deathCountdown = 0;
    this.deathRespawnTime = 4;

    this.readyBlinkInterval = 9/60;
    this.readyCountdown = 0;
    this.readySpawnTime = 2;

    this.game.engine.events.simulate.push(this.simulateListener.bind(this));
    this.game.engine.events.render.push(this.renderListener.bind(this));

    this.resetPlayer();
}

Megaman.LevelRunner.prototype.createCharacterInput = function()
{
    var input = new Engine.Keyboard();
    var game = this.game;
    var character = this.game.player.character;
    var levelrunner = this;
    input.intermittent(input.LEFT,
        function() {
            character.moveLeftStart();
        },
        function() {
            character.moveLeftEnd();
        });
    input.intermittent(input.RIGHT,
        function() {
            character.moveRightStart();
        },
        function() {
            character.moveRightEnd();
        });

    input.intermittent(input.A,
        function() {
            character.jumpStart();
        },
        function() {
            character.jumpEnd();
        });
    input.hit(input.B,
        function() {
            character.fire();
        });
    input.hit(input.START,
        function() {
            levelrunner.toggleMenu();
        });
    input.hit(input.SELECT,
        function() {
            game.setScene()
        });

    return input;
}

Megaman.LevelRunner.prototype.createMenuInput = function()
{
    var input = new Engine.Keyboard();
    return input;
}

Megaman.LevelRunner.prototype.followPlayer = function()
{
    this.level.camera.follow(this.game.player.character,
                             this.cameraFollowOffset);
}

Megaman.LevelRunner.prototype.renderListener = function()
{
    if (this.readyCountdown > 0) {
        var readyElapsedTime = this.readyCountdown - this.game.engine.timeElapsedTotal;
        var f = readyElapsedTime % this.readyBlinkInterval;
        this.assets.ready.visible = f >= this.readyBlinkInterval / 2;
        if (this.game.engine.timeElapsedTotal > this.readyCountdown) {
            this.game.engine.scene.scene.remove(this.assets.ready);
            this.resumeGamePlay();
            this.readyCountdown = 0;
        }
    }
}

Megaman.LevelRunner.prototype.simulateListener = function()
{
    if (this.deathCountdown === 0 && this.game.player.character.health.isDepleted()) {
        this.game.player.lifes--;
        this.deathCountdown = this.game.engine.timeElapsedTotal + this.deathRespawnTime;
    }
    if (this.deathCountdown > 0 && this.game.engine.timeElapsedTotal > this.deathCountdown) {
        if (this.game.player.lifes == 0) {
            this.game.endLevel();
        }
        else {
            this.resetPlayer();
        }
    }
}

Megaman.LevelRunner.prototype.spawnCharacter = function(name)
{
    var character = new Engine.assets.objects.characters[name]();
    var player = this.game.player.character;
    var distance = {
        x: 32,
        y: 32,
    }
    this.level.addObject(character,
                         player.position.x + (player.direction > 0 ? distance.x : -distance.x),
                         player.position.y + distance.y);
    return character;
}

Megaman.LevelRunner.prototype.startGamePlay = function()
{
    this.game.engine.run();
}

Megaman.LevelRunner.prototype.pauseGamePlay = function()
{
    this.inputs.character.disable();
    this.inputs.menu.enable();
    this.game.engine.isSimulating = false;
}

Megaman.LevelRunner.prototype.resumeGamePlay = function()
{
    this.inputs.menu.disable();
    this.inputs.character.enable();
    this.game.engine.isSimulating = true;
}

Megaman.LevelRunner.prototype.resetCheckpoint = function()
{
    this.readyCountdown = this.game.engine.timeElapsedTotal + this.readySpawnTime;

    this.assets.ready.position.x = this.level.camera.camera.position.x;
    this.assets.ready.position.y = this.level.camera.camera.position.y;

    this.game.engine.scene.scene.add(this.assets.ready);
    this.game.engine.scene.updateTime(0);
}

Megaman.LevelRunner.prototype.resetPlayer = function()
{
    this.deathCountdown = 0;
    this.pauseGamePlay();
    this.game.player.equipWeapon('p');
    var character = this.game.player.character;
    this.level.removeObject(character);

    var checkpoint = this.level.checkPoints[this.checkPointIndex];
    this.level.camera.jumpTo(checkpoint.pos.clone().add(this.cameraFollowOffset));

    var game = this.game;
    var startFollow = function(character) {
        game.level.followPlayer();
        character.unbind('teleport-end', arguments.callee);
    };
    character.bind('teleport-end', startFollow);

    character.isPlayer = true;
    character.health.fill();
    character.stunnedTime = 0;
    character.teleportTo(checkpoint.pos);
    this.level.addObject(character,
                    checkpoint.pos.x + this.checkPointOffset.x,
                    checkpoint.pos.y + this.checkPointOffset.y);

    this.resetCheckpoint();
}


var game = Megaman.createGame('resource/Megaman2.xml', function() {
    console.log('Loading game done', game);
    game.attachToElement(document.getElementById('screen'));
});


var pendelum = function(dt)
{
    this.momentum.x = Math.sin(this.time) * 20;
    Engine.assets.Object.prototype.timeShift.call(this, dt);
}

var circle = function(dt)
{
    var speed = 100;
    //this.momentum.x = Math.sin(this.time) * speed;
    this.momentum.y = Math.cos(this.time) * speed;
    //this.momentum.x += dt * 100;
    //this.momentum.y += dt;
    Engine.assets.Object.prototype.timeShift.call(this, dt);
}


var keyBoardEvent = function(event) {
    event.stopPropagation();
    var map = {
        "touchstart": "keydown",
        "touchend": "keyup",
        "mousedown": "keydown",
        "mouseup": "keyup",
    };
    var name = map[event.type]
    var event = document.createEvent("Event");
    event.initEvent(name, true, true);
    event.keyCode = Engine.Keyboard.prototype[this.rel];
    window.dispatchEvent(event);
}

$('#nes-controller a')
    .on('touchstart', keyBoardEvent)
    .on('touchend', keyBoardEvent)
    .on('mousedown', keyBoardEvent)
    .on('mouseup', keyBoardEvent);
