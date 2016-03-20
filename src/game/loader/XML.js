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

Game.Loader.XML.prototype.followNode = function(node)
{
    var loader = this;
    return new Promise(function(resolve, reject) {
        if (node.attr('src')) {
            var url = loader.resolveURL(node, 'src');
            console.log('Digging deeper', url);
            loader.asyncLoadXml(url).then(function(node) {
                resolve(loader.followNode(node));
            });
        } else {
            resolve(node);
        }
    });
}

Game.Loader.XML.prototype.resolveURL = function(node, attr)
{
    var url = node.attr(attr || 'url');
    if (node[0].ownerDocument.baseURL === undefined) {
        return url;
    }
    if (url.indexOf('http') === 0) {
        return url;
    }
    var baseUrl = node[0].ownerDocument.baseURL
                         .split('/')
                         .slice(0, -1)
                         .join('/') + '/';
    return baseUrl + url;
}

Game.Loader.XML.prototype.loadGame = function(url)
{
    var gameParser = new Game.Loader.XML.Parser.GameParser(this);
    return this.asyncLoadXml(url).then(function(node) {
        return gameParser.parseGame(node);
    });
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
        var stageSelectParser = new Game.Loader.XML.Parser.StageSelectParser(this);
        return stageSelectParser.parseStageSelect(sceneNode);
    }

    throw new Error('Scene type "' + type + '" not recognized');
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
