'use strict';

Game.Loader.XML =
class XMLLoader
extends Game.Loader
{
    constructor(game)
    {
        super(game);
        this.sceneIndex = {};
    }
    asyncLoadXml(url)
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
    followNode(node)
    {
        return new Promise((resolve, reject) => {
            if (node.getAttribute('src')) {
                const url = this.resolveURL(node, 'src');
                this.asyncLoadXml(url).then(function(doc) {
                    resolve(doc.children[0]);
                });
            } else {
                resolve(node);
            }
        });
    }
    resolveURL(node, attr)
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
    loadGame(url)
    {
        var gameParser = new Game.Loader.XML.Parser.GameParser(this);
        return this.asyncLoadXml(url).then(function(doc) {
            return gameParser.parse(doc.getElementsByTagName('game')[0]);
        });
    }
    parseScene(sceneNode)
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
    startScene(name)
    {
        if (!this.sceneIndex[name]) {
            throw new Error('Scene "' + name + '" does not exist');
        }

        this.game.pause();
        var loader = this;
        return this.asyncLoadXml(this.sceneIndex[name].url)
            .then(function(node) {
                return loader.parseScene(node.children[0]);
            })
            .then(function(scene) {
                loader.game.setScene(scene);
                return scene;
            });
    }
}

Game.Loader.XML.createFromXML = function(url, callback)
{
    var game =  new Game();
    var loader = new Game.Loader.XML(game);

    var promise = new Promise(function(resolve, reject) {
        loader.loadGame(url).then(function() {
            resolve(loader);
        });
    });

    return {
        game: game,
        loader: loader,
        promise: promise,
    }
}
