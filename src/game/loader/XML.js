Game.Loader.XML = function(game)
{
    Game.Loader.call(this, game);
    this.resource = new Game.ResourceManager();
    this.sceneIndex = {};
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
    return new Promise(function(resolve, reject) {
        loader.loadGame(url).then(function() {
            resolve(loader);
        });
    });
}

Game.Loader.XML.prototype.asyncLoadXml = function(url)
{
    var loader = this;
    return new Promise(function(resolve, reject) {
        $.ajax({
            url: url,
            dataType: 'xml',
            error: function(jqXHR, status, e) {
                reject(e);
            },
            success: function(result) {
                result.baseURL = url;
                var node = $(result).children(':first');
                resolve(node);
            },
        });
    });
}

Game.Loader.XML.prototype.getAbsoluteUrl = function(node, attr)
{
    var url = node.attr(attr || 'url');
    if (node[0].ownerDocument.baseURL === undefined) {
        return url;
    }

    if (url.indexOf('http') === 0) {
        return url;
    }
    var baseUrl = node[0].ownerDocument.baseURL.split('/').slice(0, -1).join('/') + '/';
    return baseUrl + url;
}

Game.Loader.XML.prototype.loadGame = function(url)
{
    var gameParser = new Game.Loader.XML.Parser.GameParser(this);
    return this.asyncLoadXml(url).then(function(node) {
        return gameParser.parseGame(node);
    });
}

Game.Loader.XML.prototype.parseObjects = function(objectsNode, callback)
{
    var parser = new Game.Loader.XML.Parser.ObjectParser(this);
    return parser.parse(objectsNode, callback);
}

Game.Loader.XML.prototype.parseScene = function(sceneNode)
{
    if (!sceneNode.is('scene')) {
        throw new TypeError('Node not <scene>');
    }

    var type = sceneNode.attr('type');
    if (type === 'level') {
        var levelParser = new Game.Loader.XML.Parser.LevelParser(this);
        return levelParser.parse(sceneNode);
    } else if (type === 'stage-select') {
        return this.parseStageSelect(sceneNode);
    }

    throw new Error('Scene type "' + type + '" not recognized');
}

Game.Loader.XML.prototype.parseStageSelect = function(sceneNode, callback)
{
    var loader = this;
    var parser = new Game.Loader.XML.Parser.GameParser(loader);

    return new Promise(function(resolve) {
        if (!sceneNode.is('scene[type=stage-select]')) {
            throw new TypeError('Node not <scene type="stage-select">');
        }

        var scene = new Game.scenes.StageSelect(loader.game, new Engine.World());
        var textureNode = sceneNode.find('texture');
        var texture = parser.getTexture(textureNode);
        var textureSize = parser.getVector2(textureNode, 'w', 'h');

        var backgroundNode = sceneNode.children('background');
        scene.setBackgroundColor(backgroundNode.attr('color'));

        var cameraNode = sceneNode.children('camera');
        scene.cameraDistance = parseFloat(cameraNode.attr('distance')) || scene.cameraDistance;

        var indicatorNode = sceneNode.children('indicator');
        scene.setIndicator(Engine.SpriteManager.createTile(
            texture,
            parseFloat(indicatorNode.attr('w')), parseFloat(indicatorNode.attr('h')),
            parseFloat(indicatorNode.attr('x')), parseFloat(indicatorNode.attr('y')),
            textureSize.x, textureSize.y));

        scene.indicatorInterval = parseFloat(indicatorNode.attr('blink-interval')) || scene.indicatorInterval;

        var frameNode = sceneNode.children('frame');
        scene.setFrame(Engine.SpriteManager.createTile(
            texture,
            parseFloat(frameNode.attr('w')), parseFloat(frameNode.attr('h')),
            parseFloat(frameNode.attr('x')), parseFloat(frameNode.attr('y')),
            textureSize.x, textureSize.y));

        var stagesNode = sceneNode.find('> stage');
        scene.rowLength = Math.ceil(Math.sqrt(stagesNode.length));
        stagesNode.each(function() {
            var stageNode = $(this);
            var avatar = Engine.SpriteManager.createTile(
                texture,
                parseFloat(stageNode.attr('w')), parseFloat(stageNode.attr('h')),
                parseFloat(stageNode.attr('x')), parseFloat(stageNode.attr('y')),
                textureSize.x, textureSize.y);
            var index = parseFloat(stageNode.attr('index'));
            var name = stageNode.attr('name');
            var caption = stageNode.attr('caption');
            scene.addStage(avatar, caption, name);
        });

        scene.equalize(parseFloat(indicatorNode.attr('initial-index')));

        var stageSelect = scene;
        scene.events.bind(scene.EVENT_STAGE_SELECTED, function(stage, index) {
            loader.startScene(stage.name, function(scene) {
                scene.events.bind(scene.EVENT_END, function() {
                    loader.game.setScene(stageSelect);
                })
            });
        });

        resolve(scene);
    });
}

Game.Loader.XML.prototype.startScene = function(name)
{
    if (!this.sceneIndex[name]) {
        throw new Error('Scene "' + name + '" does not exist');
    }

    var loader = this;
    return this.asyncLoadXml(this.sceneIndex[name].url)
        .then(function(node) {
            return loader.parseScene(node);
        })
        .then(function(scene) {
            loader.game.setScene(scene);
            return scene;
        });
}

Game.Loader.XML.prototype.followNode = function(node)
{
    var loader = this;
    return new Promise(function(resolve, reject) {
        if (node.attr('src')) {
            var url = loader.getAbsoluteUrl(node, 'src');
            console.log('Digging deeper', url);
            loader.asyncLoadXml(url).then(function(node) {
                resolve(loader.followNode(node));
            });
        } else {
            resolve(node);
        }
    });
}
