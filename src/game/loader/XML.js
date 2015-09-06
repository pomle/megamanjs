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
    game.player = new Game.Player();
    game.player.hud = new Hud($('#screen'));

    var loader = new Game.Loader.XML(game);
    loader.loadGame(url, callback);

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
            var node = $(result);
            result.baseURL = url;
            callback(node);
        }
    });
}

Game.Loader.XML.prototype.load = function(url, callback)
{
    console.log(url);
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


Game.Loader.XML.prototype.loadLevel = function(url, callback)
{
    var loader = this;
    this.load(url, function(node) {
        var level = loader.parseLevel(node);
        callback(level);
    });
}


Game.Loader.XML.prototype.parseCharacter = function(characterNode, callback)
{
    var parser = new Game.Loader.XML.Parser.CharacterParser(this);
    parser.callback = callback;
    parser.parse(characterNode);
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

    var playerParse = function()
    {
        var playerNode = gameNode.find('> player');
        var character = new (loader.game.resource.get('character', playerNode.find('> character').attr('id')))();
        character.invincibility.duration = parseFloat(playerNode.find('> invincibility').attr('duration'));
        game.player.setCharacter(character);
        game.hud.equipCharacter(game.player.character);

        entryPointParse();
        callback();
    }

    var characterQueue = 0;
    var characterLoaded = function()
    {
        --characterQueue;
        if (characterQueue === 0) {
            playerParse();
        }
    }

    gameNode.find('> characters > objects').each(function() {
        var objectsNode = $(this);
        ++characterQueue;
        loader.traverseNode(objectsNode, function(objectsNode) {
            var parser = new Game.Loader.XML.Parser.ObjectParser(loader);
            var characters = parser.parse(objectsNode);
            for (var characterId in characters) {
                loader.game.resource.addAuto(characterId, characters[characterId]);
            }
            characterLoaded();
        });
    });
}

Game.Loader.XML.prototype.parseLevel = function(levelNode, callback)
{
    var parser = new Game.Loader.XML.Parser.LevelParser(this);
    parser.callback = callback;
    return parser.parse(levelNode);
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
