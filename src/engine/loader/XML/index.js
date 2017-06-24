import Loader from '../../Loader';
import GameParser from './GameParser';

import SceneParser from './SceneParser';
import LevelParser from './LevelParser';
import StageSelectParser from './StageSelectParser';

class XMLLoader extends Loader
{
    constructor(game)
    {
        super(game);
        this.entryPoint = null;
        this.sceneIndex = {};
    }
    asyncLoadXML(url)
    {
        return this.resourceLoader.loadXML(url);
    }
    followNode(node)
    {
        const url = this.resolveURL(node, 'src');
        if (!url) {
            return Promise.resolve(node);
        }
        return this.asyncLoadXML(url).then(doc => {
            return doc.children[0];
        });
    }
    loadGame(url)
    {
        return this.asyncLoadXML(url).then(doc => {
            const node = doc.querySelector('game');
            const parser = new GameParser(this, node);
            return parser.parse();
        });
    }
    loadScene(url)
    {
        return this.asyncLoadXML(url).then(doc => {
            const sceneNode = doc.querySelector('scene');
            return this.parseScene(sceneNode);
        });
    }
    loadSceneByName(name)
    {
        if (!this.sceneIndex[name]) {
            throw new Error(`Scene "${name}" does not exist.`);
        }

        return this.loadScene(this.sceneIndex[name].url);
    }
    parseScene(node)
    {
        if (node.tagName !== 'scene') {
            throw new TypeError('Node not <scene>');
        }

        const type = node.getAttribute('type');
        if (type) {
            if (type === 'level') {
                const parser = new LevelParser(this, node);
                return parser.getScene();
            } else if (type === 'stage-select') {
                const parser = new StageSelectParser(this, node);
                return parser.getScene();
            } else {
                throw new Error(`Scene type "${type}" not recognized`);
            }
        } else {
            const parser = new SceneParser(this, node);
            return parser.getScene();
        }
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
            .split('/').slice(0, -1).join('/') + '/';

        return baseUrl + url;
    }
}

export default XMLLoader;
