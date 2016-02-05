Game.Loader.XML = function(game)
{
    Game.Loader.call(this, game);
    this.sceneIndex = {};

    this.parser = new Game.Loader.XML.Parser(this);
}

Engine.Util.extend(Game.Loader.XML, Game.Loader);

Game.Loader.XML.createFromXML = function(url, callback)
{
    var renderer = new THREE.WebGLRenderer({
        'antialias': false,
    });

    var game = new Game();
    game.engine = new Engine(renderer);

    var loader = new Game.Loader.XML(game);
    loader.loadGame(url, callback);

    game.loader = loader;

    return game;
}

Game.Loader.XML.prototype.asyncLoadXml = function(url, callback)
{
    return $.ajax({
        url: url,
        dataType: 'xml',
        error: function(jqXHR, status, e) {
            throw e;
        },
        success: function(result) {
            result.baseURL = url;
            var node = $(result);
            callback(node);
        }
    });
}

Game.Loader.XML.prototype.load = function(url, callback)
{
    var loader = this;
    loader.asyncLoadXml(url, function(node) {
        var firstNode = node.children(':first');
        loader.traverseNode(firstNode, callback);
    });
}

Game.Loader.XML.prototype.loadGame = function(url, callback)
{
    var loader = this;
    this.load(url, function(node) {
        loader.parseGame(node, callback);
    });
}

Game.Loader.XML.prototype.parseCharacter = function(characterNode, callback)
{
    var parser = new Game.Loader.XML.Parser.CharacterParser(this);
    return parser.parse(characterNode, callback);
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
            'url': loader.parser.getAbsoluteUrl(sceneNode, 'src'),
        };
    });

    var entryPointParse = function()
    {
        gameNode.find('> level').each(function() {
            levelNode = $(this);
            Game.scenes.Level.prototype.assets['level-start-text']
                = Engine.SpriteManager.createTextSprite(levelNode.attr('start-caption'));
        });

        var entrySceneName = gameNode.find('> entrypoint > scene').attr('name');
        loader.startScene(entrySceneName);
    }

    var playerNode = gameNode.find('> player');
    var playerCharacterId = playerNode.find('> character').attr('id');
    game.player.defaultWeapon = playerNode.find('> weapon').attr('default');

    var characterReady = function(characterId)
    {
        if (characterId !== playerCharacterId) {
            return;
        }

        var character = new (loader.game.resource.get('character', characterId))();
        character.invincibility.duration = parseFloat(playerNode.find('> invincibility').attr('duration'));
        game.player.setCharacter(character);

        entryPointParse();
        callback();
    }

    gameNode.find('> characters > objects').each(function() {
        var objectsNode = $(this);
        loader.traverseNode(objectsNode, function(objectsNode) {
            var characters = loader.parseObjects(objectsNode);
            for (var characterId in characters) {
                loader.game.resource.addAuto(characterId, characters[characterId]);
                characterReady(characterId);
            }
        });
    });
}

Game.Loader.XML.prototype.parseLevel = function(levelNode, callback)
{
    var parser = new Game.Loader.XML.Parser.LevelParser(this);
    parser.parse(levelNode, callback);
    return parser.level;
}

Game.Loader.XML.prototype.parseObjects = function(objectsNode, callback)
{
    var parser = new Game.Loader.XML.Parser.ObjectParser(this);
    return parser.parse(objectsNode, callback);
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

    scene.events.bind(scene.EVENT_STAGE_SELECTED, function(stage, index) {
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
    this.load(this.sceneIndex[name].url, function(node) {
        loader.parseScene(node, function(scene) {
            loader.game.setScene(scene);
        });
    });
}

Game.Loader.XML.prototype.traverseNode = function(node, callback)
{
    if (node.attr('src')) {
        this.load(this.parser.getAbsoluteUrl(node, 'src'), callback);
    }
    else {
        callback(node);
    }
}
