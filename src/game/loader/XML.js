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
    asyncLoadXML(url)
    {
        return fetch(url)
            .then(response => {
                return response.text();
            })
            .then(text => {
                const parser = new DOMParser();
                const doc = parser.parseFromString(text, 'text/xml');
                doc.baseURL = url;
                return doc;
            });
    }
    followNode(node)
    {
        const url = this.resolveURL(node, 'src');
        if (!url) {
            return Promise.resolve(node);
        }
        return this.asyncLoadXML(url)
            .then(doc => {
                return doc.children[0];
            });
    }
    loadScene(url)
    {
        return this.asyncLoadXML(url)
            .then(node => {
                return this.parseScene(node.children[0]);
            });
    }
    parseScene(sceneNode)
    {
        if (sceneNode.tagName !== 'scene') {
            throw new TypeError('Node not <scene>');
        }

        const type = sceneNode.getAttribute('type');
        if (type === 'level') {
            const levelParser = new Game.Loader.XML.Parser.LevelParser(this);
            return levelParser.parse(sceneNode);
        } else if (type === 'stage-select') {
            const stageSelectParser = new Game.Loader.XML.Parser.StageSelectParser(this);
            return stageSelectParser.parse(sceneNode);
        }

        throw new Error('Scene type "' + type + '" not recognized');
    }
    resolveURL(node, attr)
    {
        const url = node.getAttribute(attr || 'url');
        if (!url) {
            return null;
        }

        if (node.ownerDocument.baseURL === undefined) {
            return url;
        }
        if (url.indexOf('http') === 0) {
            return url;
        }
        const baseUrl = node.ownerDocument.baseURL
                             .split('/')
                             .slice(0, -1)
                             .join('/') + '/';
        return baseUrl + url;
    }
    startScene(name)
    {
        if (!this.sceneIndex[name]) {
            throw new Error('Scene "' + name + '" does not exist');
        }

        this.game.pause();
        return this.loadScene(this.sceneIndex[name].url)
            .then(scene => {
                this.game.setScene(scene);
                return scene;
            });
    }
}

Game.Loader.XML.createFromXML = function(url, callback)
{
    const game =  new Game();
    const loader = new Game.Loader.XML(game);
    return loader.asyncLoadXML(url)
        .then(doc => {
            const gameParser = new Game.Loader.XML.Parser.GameParser(loader);
            return gameParser.parse(doc.getElementsByTagName('game')[0]);
        })
        .then(() => {
            return loader;
        });
}
