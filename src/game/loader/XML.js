'use strict';

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

    var game =  new Game();
    game.engine = new Engine(renderer);

    var loader = new Game.Loader.XML(game);

    var promise = new Promise(function(resolve, reject) {
        loader.loadGame(url).then(function() {
            resolve();
        }).catch(reject);
    });

    return {
        game: game,
        loader: loader,
        promise: promise,
    }
}

Game.Loader.XML.prototype.asyncLoadXML = function(url)
{
    var loader = this;
    return new Promise(function(resolve, reject) {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', url);
        xhr.addEventListener('load', function() {
            if (xhr.status === 200) {
                var parser = new DOMParser();
                var doc = parser.parseFromString(xhr.responseText, 'text/xml');
                doc.baseURL = url;
                resolve(doc);
            } else {
                reject(new Error('Failed to load ' + url + ' (' + xhr.status + ')'));
            }
        });
        xhr.send(null);
    });
}

Game.Loader.XML.prototype.followNode = function(node)
{
    return new Promise((resolve, reject) => {
        if (node.getAttribute('src')) {
            const url = this.resolveURL(node, 'src');
            console.log('Digging deeper', url);
            this.asyncLoadXML(url).then(function(doc) {
                resolve(doc.children[0]);
            });
        } else {
            resolve(node);
        }
    });
}

Game.Loader.XML.prototype.resolveURL = function(node, attr)
{
    var url = node.getAttribute(attr || 'url');
    if (node.ownerDocument.baseURL === undefined) {
        return url;
    }
    if (url.indexOf('http') === 0) {
        return url;
    }
    var baseUrl = node.ownerDocument.baseURL
                         .split('/')
                         .slice(0, -1)
                         .join('/') + '/';
    return baseUrl + url;
}

Game.Loader.XML.prototype.loadGame = function(url)
{
    var gameParser = new Game.Loader.XML.Parser.GameParser(this);
    return this.asyncLoadXML(url).then(function(doc) {
        return gameParser.parse(doc.getElementsByTagName('game')[0]);
    });
}

Game.Loader.XML.prototype.parseScene = function(sceneNode)
{
    if (sceneNode.tagName !== 'scene') {
        throw new TypeError('Node not <scene>');
    }

    var type = sceneNode.getAttribute('type');
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

    this.game.engine.pause();
    var loader = this;
    return this.asyncLoadXML(this.sceneIndex[name].url)
        .then(function(node) {
            return loader.parseScene(node.children[0]);
        })
        .then(function(scene) {
            loader.game.setScene(scene);
            return scene;
        });
}
