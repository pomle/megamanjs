Game.Loader.XML = function(game)
{
    Game.Loader.call(this, game);
    this.sceneIndex = {};
}

Game.Loader.XML.prototype.defaultMaterial = new THREE.MeshBasicMaterial({
    color: 0x0000ff,
    wireframe: true,
    side: THREE.DoubleSide,
    transparent: true,
});

Game.Loader.XML.prototype.asyncLoadXml = function(url, callback, async)
{
    xhr = new XMLHttpRequest();

    var loader = this;
    xhr.onreadystatechange = function()
    {
        if (this.readyState === 4) {
            var node = $(jQuery.parseXML(this.responseText));
            callback(node);
        }
    }
    xhr.onerror = function() {
        throw new Error('URL ' + url + ' error ' + this.statusText);
    }

    xhr.overrideMimeType('text/xml');
    xhr.open("GET", url, true);
    xhr.send();
}

Game.Loader.XML.prototype.createUrl = function(relativeUrl)
{
    return this.baseUrl + relativeUrl;
}

Game.Loader.XML.prototype.load = function(url, callback)
{
    console.log(url);
    var loader = this;
    loader.asyncLoadXml(url, function(node) {
        var firstNode = node.children(':first');
        firstNode.url = url;
        firstNode.baseUrl = url.split('/').slice(0, -1).join('/') + '/';
        loader.traverseNode(firstNode, callback);
    });
}

Game.Loader.XML.prototype.parseCharacter = function(characterNode, callback)
{
    if (!characterNode.is('character')) {
        throw new TypeError("Not <character> node");
    }
    var loader = this;
    var game = this.game;

    var modelNode = characterNode.find('> model');
    var modelSize = {
        x: parseFloat(modelNode.attr('w')),
        y: parseFloat(modelNode.attr('h')),
    }

    var animator = new Engine.Animator.UV();
    var defaultTextureId = undefined;

    modelNode.find('> textures > texture').each(function() {
        var textureNode = $(this);
        var textureSize = {
            x: parseFloat(textureNode.attr('w')),
            y: parseFloat(textureNode.attr('h')),
        }
        var textureUrl = characterNode.baseUrl + textureNode.attr('url');
        var texture = Engine.TextureManager.getScaledTexture(textureUrl, game.resource.textureScale);

        var textureId = textureNode.attr('id');
        if (!textureId) {
            throw new Error("No id attribute on " + textureNode[0].outerHTML);
        }

        if (defaultTextureId === undefined) {
            defaultTextureId = textureId;
        }

        game.resource.addTexture(textureId, texture);

        var defaultAnimation = undefined;
        textureNode.find('> animations > animation').each(function() {
            var animationNode = $(this);
            var animation = animator.createAnimation(animationNode.attr('id'), animationNode.attr('group'));
            animationNode.find('> frame').each(function() {
                var frameNode = $(this);
                var frameOffset = {
                    x: parseFloat(frameNode.attr('x')),
                    y: parseFloat(frameNode.attr('y')),
                }
                var uvMap = Engine.SpriteManager.createUVMap(frameOffset.x, frameOffset.y,
                                                             modelSize.x, modelSize.y,
                                                             textureSize.x, textureSize.y);
                var duration = parseFloat(frameNode.attr('duration')) || undefined;
                animation.addFrame(uvMap, duration);
            });
            if ('true' === animationNode.attr('default')) {
                animator.setAnimation(animation);
            }
        });
    });

    var collision = [];
    modelNode.find('> collision > rect').each(function() {
        var rectNode = $(this);
        collision.push({
            w: parseFloat(rectNode.attr('w')),
            h: parseFloat(rectNode.attr('h')),
            x: parseFloat(rectNode.attr('x')),
            y: parseFloat(rectNode.attr('y')),
        });
    });

    loader = undefined;


    var sourceName = characterNode.attr('source');
    var source = Game.objects.characters[sourceName];

    var character = function()
    {
        this._parentName = sourceName;
        this.geometry = new THREE.PlaneGeometry(modelSize.x, modelSize.y);
        this.material = new THREE.MeshBasicMaterial({
            side: THREE.DoubleSide,
            map: game.resource.get('texture', defaultTextureId),
            transparent: true,
        });

        source.call(this);

        this.animator = new Engine.Animator.UV();
        this.animator.copy(animator);
        this.animator.addGeometry(this.model.geometry);


        for (var i in collision) {
            var r = collision[i];
            this.addCollisionRect(r.w, r.h, r.x, r.y);
        }
    }

    Engine.Util.extend(character, source);

    callback(character);
}

Game.Loader.XML.prototype.parseGame = function(gameNode, callback)
{
    var loader = this;
    if (!gameNode.is('game')) {
        throw new TypeError('Node not <game>');
    }

    var configNode = gameNode.find('> config');
    this.game.resource.textureScale = parseFloat(configNode.attr('texture-scale')) || this.game.resource.textureScale;

    gameNode.find('> weapons > weapon').each(function() {
        var weaponNode = $(this);
        loader.parseWeapon(weaponNode, function(weapon) {
            game.resource.addAuto(weaponNode.attr('id'), weapon);
            var weapon = new weapon();
            game.player.weapons[weapon.code] = weapon;
        });
    });

    gameNode.find('> scenes > scene').each(function() {
        var sceneNode = $(this);
        loader.sceneIndex[sceneNode.attr('name')] = {
            'url': gameNode.baseUrl + sceneNode.attr('src'),
        };
    });

    var queue = 0;
    var playerParse = function()
    {
        var playerNode = gameNode.find('> player');
        var character = new (loader.game.resource.get('character', playerNode.find('> character').attr('id')))();
        character.invincibility.duration = parseFloat(playerNode.find('> invincibility').attr('duration'));
        game.player.setCharacter(character);
        game.player.hud.equipCharacter(game.player.character);

        gameNode.find('> level').each(function() {
            levelNode = $(this);
            Game.scenes.Level.prototype.assets['level-start-text'] = Engine.SpriteManager.createTextSprite(levelNode.attr('start-caption'));
        });

        var entrySceneName = gameNode.find('> entrypoint > scene').attr('name');
        loader.startScene(entrySceneName);

        callback();
    }

    var cont = function()
    {
        --queue;
        if (queue === 0) {
            playerParse();
        }
    }

    gameNode.find('> characters > character').each(function() {
        var characterNode = $(this);
        characterNode.baseUrl = gameNode.baseUrl;
        ++queue;
        loader.traverseNode(characterNode, function(character) {
            loader.game.resource.addAuto(characterNode.attr('id'), character);
            cont();
        });
    });
}

Game.Loader.XML.prototype.parseLevel = function(levelNode, callback)
{
    var parser = new Game.Loader.XML.Parser.LevelParser(this);
    parser.callback = callback;
    parser.parse(levelNode);
}

Game.Loader.XML.prototype.parseScene = function(sceneNode, callback)
{
    var loader = this;
    if (!sceneNode.is('scene')) {
        throw new TypeError('Node not <scene>');
    }
    var type = sceneNode.attr('type');
    switch (type) {
        case 'level':
            this.parseLevel(sceneNode, callback);
            break;
        case 'stage-select':
            this.parseStageSelect(sceneNode, callback);
            break;
        default:
            throw new Error('Scene type "' + type + '" not recognized');
    }
}

Game.Loader.XML.prototype.parseStageSelect = function(sceneNode, callback)
{
    var loader = this;
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

    callback(scene);
}

Game.Loader.XML.prototype.parseWeapon = function(weaponNode, callback)
{
    if (!weaponNode.is('weapon')) {
        throw new TypeError('Node not <weapon>');
    }

    var sourceName = weaponNode.attr('source');
    var source = Game.objects.weapons[sourceName];

    var code = weaponNode.attr('code');
    var name = weaponNode.attr('name');


    var weapon = function()
    {
        source.call(this);
        this._parentName = sourceName;
        this.code = code;
        this.name = name;
    }

    Engine.Util.extend(weapon, source);

    callback(weapon);
}

Game.Loader.XML.prototype.startScene = function(name, callback)
{
    if (!this.sceneIndex[name]) {
        throw new Error('Scene "' + name + '" does not exist');
    }

    var loader = this;
    this.load(this.sceneIndex[name].url, function(scene) {
        loader.game.setScene(scene);
    });
}

Game.Loader.XML.prototype.traverseNode = function(node, callback)
{
    var src = node.attr('src');
    if (src) {
        if (!node.baseUrl) {
            throw new Error('baseUrl not attached');
        }
        this.load(node.baseUrl + src, callback);
    }
    else {
        var tag = node[0].tagName.toLowerCase();
        switch (tag) {
            case 'character':
                this.parseCharacter(node, callback);
                break;
            case 'game':
                this.parseGame(node, callback);
                break;
            case 'scene':
                this.parseScene(node, callback);
                break;
            default:
                throw new Error('No parser for node <' + tag + '>');
        }
    }
}
