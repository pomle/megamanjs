Game.Loader.XML = function(game)
{
    Game.Loader.call(this, game);
    this.sceneIndex = {};

    this.parser = new Game.Loader.XML.Parser(this);
}

Game.Loader.XML.prototype.defaultMaterial = new THREE.MeshBasicMaterial({
    color: 0x0000ff,
    wireframe: true,
    side: THREE.DoubleSide,
    transparent: true,
});

Game.Loader.XML.prototype.asyncLoadXml = function(url, callback, async)
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
        game.player.hud.equipCharacter(game.player.character);

        entryPointParse();
        callback();
    }

    var characterQueue = 0;
    var cont = function()
    {
        --characterQueue;
        if (characterQueue === 0) {
            playerParse();
        }
    }

    gameNode.find('> characters > character').each(function() {
        var characterNode = $(this);
        ++characterQueue;
        loader.traverseNode(characterNode, function(node) {
            loader.parseCharacter(node, function(character) {
                loader.game.resource.addAuto(characterNode.attr('id'), character);
                cont();
            });
        });
    });
}

Game.Loader.XML.prototype.parseLevel = function(levelNode, callback)
{
    var parser = new Game.Loader.XML.Parser.LevelParser(this);
    parser.baseUrl = levelNode.baseUrl;
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
