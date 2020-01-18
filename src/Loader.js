const {XMLLoader, Parser} = require('@snakesilk/xml-loader');

const GameParser = require('./parsers/GameParser');
const StageSelectParser = require('./parsers/StageSelectParser');
const LevelParser = require('./parsers/LevelParser');

class Loader extends XMLLoader
{
    constructor(game) {
        super(game);

        this.gameParser = new GameParser(this);
        this.levelParser = new LevelParser(this);
        this.stageSelectParser = new StageSelectParser(this);
        this.sceneParser = new Parser.SceneParser(this);

        this.entryPoint = null;
        this.sceneIndex = {};
    }

    loadGame(url) {
        return this.asyncLoadXML(url).then(doc => {
            const node = doc.querySelector('game');
            return this.gameParser.parseGame(node);
        });
    }

    loadScene(url) {
        return this.asyncLoadXML(url)
        .then(doc => this.parseScene(doc.children[0]))
        .then(context => context.scene);
    }

    loadSceneByName(name) {
        if (!this.sceneIndex[name]) {
            throw new Error(`Scene "${name}" does not exist.`);
        }

        return this.loadScene(this.sceneIndex[name].url);
    }

    parseScene(node) {
        const type = node.tagName;
        if (type === 'level') {
            return this.levelParser.getScene(node);
        } else if (type === 'stage-select') {
            return this.stageSelectParser.getScene(node);
        } else if (type === 'scene') {
            return this.sceneParser.getScene(node);
        }

        throw new Error(`Scene type "${type}" not recognized`);
    }
}

module.exports = Loader;
