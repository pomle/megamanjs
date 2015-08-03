Game.Loader = function(game)
{
    this.game = game;
    this.sceneIndex = {};
}

Game.Loader.prototype.asyncLoadXml = function(url, callback)
{
    xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function()
    {
        if (this.readyState === 4) {
            var xmlResponse = new Game.Loader.XMLResponse(
                $(jQuery.parseXML(this.responseText)),
                url);
            callback(xmlResponse);
        }
    };
    xmlhttp.overrideMimeType('text/xml');
    xmlhttp.open("GET", url, true);
    xmlhttp.send();
    return xmlhttp;
}

Game.Loader.prototype.loadGame = function(xmlUrl, callback)
{
    var loader = this;
    return this.asyncLoadXml(xmlUrl, function(xmlResponse) {
        xmlResponse.done = callback;
        loader.parseGame(xmlResponse.fork('> game'));
    });
}

Game.Loader.prototype.loadScene = function(xmlUrl, callback)
{
    var loader = this;
    return this.asyncLoadXml(xmlUrl, function(xmlResponse) {
        xmlResponse.done = callback;
        loader.parseScene(xmlResponse.fork('> scene'));
    });
}

Game.Loader.prototype.parseGame = function(xmlResponse)
{
    var loader = this;
    var gameNode = xmlResponse.xml;
    if (!gameNode.is('game')) {
        throw new TypeError('Node not <game>');
    }

    var configNode = gameNode.find('> config');
    this.game.resources.textureScale = parseFloat(configNode.attr('texture-scale')) || this.game.resources.textureScale;

    gameNode.find('> weapons > weapon').each(function() {
        var weapon = loader.parseWeapon(xmlResponse.branch(this));
        loader.game.resources.addWeapon(weapon.name, weapon);
        game.player.weapons[weapon.code] = weapon;
    });

    var playerNode = gameNode.find('> player');
    var character = new Game.objects.characters[playerNode.find('> character').attr('name')]();
    character.invincibilityDuration = parseFloat(playerNode.find('> invincibility').attr('duration'));

    game.player.setCharacter(character);
    game.player.hud.equipCharacter(game.player.character);
    game.player.character.invincibilityDuration = 2;

    gameNode.find('> scenes > scene').each(function() {
        var sceneNode = $(this);
        loader.sceneIndex[sceneNode.attr('name')] = {
            'url': xmlResponse.createUrl(sceneNode.attr('src')),
        };
    });

    gameNode.find('> level').each(function() {
        levelNode = $(this);
        Game.scenes.Level.prototype.assets['level-start-text'] = Engine.SpriteManager.createTextSprite(levelNode.attr('start-caption'));
    });

    var entrySceneName = gameNode.find('> entrypoint > scene').attr('name');
    loader.startScene(entrySceneName);

    xmlResponse.done(this.game);

    return this.game;
}

Game.Loader.prototype.parseLevel = function(xmlResponse)
{
    var loader = this;
    var levelNode = xmlResponse.xml;
    if (!levelNode.is('scene[type=level]')) {
        throw new TypeError('Node not <scene type="level">');
    }

    var level = new Engine.World();
    var levelRunner = new Game.scenes.Level(this.game, level);

    levelNode.children('camera').each(function() {
        var cameraNode = $(this);
        var smoothing = parseFloat(cameraNode.attr('smoothing'));
        if (isFinite(smoothing)) {
            level.camera.smoothing = smoothing;
        }
    });

    levelNode.children('gravity').each(function() {
        var gravityNode = $(this);
        level.gravityForce.x = parseFloat(gravityNode.attr('x'));
        level.gravityForce.y = parseFloat(gravityNode.attr('y'));
    });

    var collisionRadius = undefined;
    levelNode.children('collision').each(function() {
        var collisionNode = $(this);
        var radius = parseFloat(collisionNode.attr('radius'));
        if (isFinite(radius)) {
            level.collision.setCollisionRadius(radius);
        }
    });

    levelNode.find('> camera > path').each(function() {
        var pathNode = $(this);
        var path = new Engine.Camera.Path();
        /* y1 and y2 is swapped because they are negative. */
        var windowNode = pathNode.children('window');
        path.window[0].x = parseFloat(windowNode.attr('x1'));
        path.window[1].x = parseFloat(windowNode.attr('x2'));
        path.window[0].y = -parseFloat(windowNode.attr('y2'));
        path.window[1].y = -parseFloat(windowNode.attr('y1'));
        var constraintNode = pathNode.children('constraint');
        path.constraint[0].x = parseFloat(constraintNode.attr('x1'));
        path.constraint[1].x = parseFloat(constraintNode.attr('x2'));
        path.constraint[0].y = -parseFloat(constraintNode.attr('y2'));
        path.constraint[1].y = -parseFloat(constraintNode.attr('y1'));
        path.constraint[0].z = parseFloat(constraintNode.attr('z1')) || undefined;
        path.constraint[1].z = parseFloat(constraintNode.attr('z2')) || undefined;
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
        levelNode.find('> sprites').each(function(i, sprites) {
            sprites = $(sprites);

            var url = xmlResponse.createUrl(sprites.attr('url'));
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
                level.addTimeline(timeline);
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
                    'x': expandRange(segmentNode.attr('x'), prop.wx),
                    'y': expandRange(segmentNode.attr('y'), prop.hx),
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
    layoutNode.find('objects > object').each(function(i, objectNode) {
        objectNode = $(objectNode);

        var ref = objectNode.attr('ref');
        var object = getObject(ref);

        var material = new THREE.MeshBasicMaterial();
        material.map = object.texture;
        material.side = THREE.DoubleSide;

        //materials.push(spriteIndex[id].material);
        var rangeX = expandRange(objectNode.attr('x'));
        var rangeY = expandRange(objectNode.attr('y'));

        for (var i in rangeX) {
            var mesh = new THREE.Mesh(object.geometry, material);
            mesh.position.x = rangeX[i] + (object.size.w / 2);
            mesh.position.y = -(rangeY[i] + (object.size.h / 2));
            level.scene.add(mesh);
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

        var name = enemyNode.attr('name');
        if (!Game.objects.characters[name]) {
            throw new Error('Item ' + name + ' does not exist');
        }

        var spawnNode = enemyNode.find('> spawn');
        var x = parseFloat(enemyNode.attr('x'));
        var y = -parseFloat(enemyNode.attr('y'));
        if (spawnNode.length) {
            var object = new Game.objects.Spawner();
            object.spawnSource.push(Game.objects.characters[name]);
            object.spawnCount = parseFloat(spawnNode.attr('count')) || undefined;
            object.maxSimultaneousSpawns = parseFloat(spawnNode.attr('simultaneous')) || 1;
            object.spawnInterval = parseFloat(spawnNode.attr('interval')) || 1;
            object.minDistance = parseFloat(spawnNode.attr('min-distance')) || object.minDistance;
            object.maxDistance = parseFloat(spawnNode.attr('max-distance')) || object.maxDistance;
        }
        else {
            var object = new Game.objects.characters[name]();
            var direction = enemyNode.attr('direction');
            if (direction == 'right') {
                object.setDirection(object.RIGHT);
            }
            else if (direction == 'left') {
                object.setDirection(object.LEFT);
            }
        }

        level.addObject(object, x, y);
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
        level.addObject(Item);
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

        level.addObject(obstacle);
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

            var c2 = collisionRadius * 2;
            if (prop.w > c2 || prop.h > c2) {
                console.error('Solid beyond collision radius %f.', collisionRadius, prop);
            }

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

            level.addObject(solid);
        });
    });

    levelNode.find('> checkpoints > checkpoint').each(function() {
        var checkpointNode = $(this);
        var x = parseFloat(checkpointNode.attr('x'));
        var y = parseFloat(checkpointNode.attr('y'));
        var r = parseFloat(checkpointNode.attr('radius'));
        levelRunner.addCheckPoint(x, -y, r || undefined);
    });

    xmlResponse.done(levelRunner);
}

Game.Loader.prototype.parseScene = function(xmlResponse)
{
    var loader = this;
    var sceneNode = xmlResponse.xml;
    if (!sceneNode.is('scene')) {
        throw new TypeError('Node not <scene>');
    }
    var type = sceneNode.attr('type');
    switch (type) {
        case 'level':
            this.parseLevel(xmlResponse);
            break;
        case 'stage-select':
            this.parseStageSelect(xmlResponse);
            break;
        default:
            throw new Error('Scene type "' + type + '" not recognized');
    }
}

Game.Loader.prototype.parseStageSelect = function(xmlResponse)
{
    var loader = this;
    var sceneNode = xmlResponse.xml;
    if (!sceneNode.is('scene[type=stage-select]')) {
        throw new TypeError('Node not <scene type="stage-select">');
    }

    var scene = new Game.scenes.StageSelect(this.game, new Engine.World());

    var spriteUrl = sceneNode.attr('url');
    var spriteW = parseFloat(sceneNode.attr('w'));
    var spriteH = parseFloat(sceneNode.attr('h'));

    var backgroundNode = sceneNode.children('background');
    scene.setBackgroundColor(backgroundNode.attr('color'));

    var cameraNode = sceneNode.children('camera');
    scene.cameraDistance = parseFloat(cameraNode.attr('distance')) || scene.cameraDistance;


    var indicatorNode = sceneNode.children('indicator');
    scene.setIndicator(Engine.SpriteManager.createSingleTile(
        spriteUrl,
        parseFloat(indicatorNode.attr('w')), parseFloat(indicatorNode.attr('h')),
        parseFloat(indicatorNode.attr('x')), parseFloat(indicatorNode.attr('y')),
        spriteW, spriteH));

    scene.indicatorInterval = parseFloat(indicatorNode.attr('blink-interval')) || scene.indicatorInterval;

    var frameNode = sceneNode.children('frame');
    scene.setFrame(Engine.SpriteManager.createSingleTile(
        spriteUrl,
        parseFloat(frameNode.attr('w')), parseFloat(frameNode.attr('h')),
        parseFloat(frameNode.attr('x')), parseFloat(frameNode.attr('y')),
        spriteW, spriteH));

    var stagesNode = sceneNode.find('> stage');
    scene.rowLength = Math.ceil(Math.sqrt(stagesNode.length));
    stagesNode.each(function() {
        var stageNode = $(this);
        var avatar = Engine.SpriteManager.createSingleTile(
            spriteUrl,
            parseFloat(stageNode.attr('w')), parseFloat(stageNode.attr('h')),
            parseFloat(stageNode.attr('x')), parseFloat(stageNode.attr('y')),
            spriteW, spriteH);
        var index = parseFloat(stageNode.attr('index'));
        var name = stageNode.attr('name');
        var caption = stageNode.attr('caption');
        scene.addStage(avatar, caption, name);
    });

    scene.equalize(parseFloat(indicatorNode.attr('initial-index')));

    scene.bind(scene.EVENT_STAGE_SELECTED, function(stage, index) {
        loader.startScene(stage.name);
    });

    xmlResponse.done(scene);

    return scene;
}

Game.Loader.prototype.parseWeapon = function(xmlResponse)
{
    var weaponNode = xmlResponse.xml;
    if (!weaponNode.is('weapon')) {
        throw new TypeError('Node not <weapon>');
    }

    var code = weaponNode.attr('code');
    var name = weaponNode.attr('name');

    if (!Game.objects.weapons[name]) {
        throw new Error('Weapon ' + name + ' does not exist');
    }
    var weapon = new Game.objects.weapons[name]();
    weapon.code = code;
    weapon.name = name;
    return weapon;
}

Game.Loader.prototype.startScene = function(name)
{
    if (!this.sceneIndex[name]) {
        throw new Error('Scene "' + name + '" does not exist');
    }
    var loader = this;
    return this.loadScene(this.sceneIndex[name].url, function(scene) {
        loader.game.setScene(scene);
    });
}

Game.Loader.XMLResponse = function(xml, url)
{
    this.xml = $(xml);
    this.url = url;
    this.baseUrl = url.split('/').slice(0, -1).join('/') + '/';
}

Game.Loader.XMLResponse.prototype.branch = function(node)
{
    return new Game.Loader.XMLResponse($(node), this.url);
}

Game.Loader.XMLResponse.prototype.createUrl = function(relativeUrl)
{
    return this.baseUrl + relativeUrl;
}

Game.Loader.XMLResponse.prototype.fork = function(selector)
{
    var xmlResponse = new Game.Loader.XMLResponse(this.xml.find(selector), this.url);
    xmlResponse.done = this.done;
    return xmlResponse;
}

Game.Loader.XMLResponse.prototype.done = function()
{

}
