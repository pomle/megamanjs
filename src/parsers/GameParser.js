const {BitmapFont} = require('@snakesilk/engine');
const {Parser, Util: {children, ensure, find}} = require('@snakesilk/xml-loader');

const WeaponParser = require('./WeaponParser');

class GameParser extends Parser
{
    constructor(loader) {
        super(loader);

        this.entityParser = new Parser.EntityParser(loader);
        this.weaponParser = new WeaponParser(loader);
    }

    parseGame(node) {
        ensure(node, 'game');

        const game = this.loader.game;

        const entrypoint = children(node, 'entrypoint')[0].getAttribute('scene');
        const characterNodes = find(node, 'characters > entities');
        const itemNodes = find(node, 'items > entities');
        const projectileNodes = find(node, 'projectiles > entities');

        this.parseConfig(node);

        return Promise.all([
            this.parseAudio(node),
            this.parseFonts(node),
            this.parseEntities(itemNodes),
            this.parseEntities(characterNodes),
            this.parseEntities(projectileNodes),
            this.parsePlayer(node, game.player),
            this.parseScenes(node),
            this.parseWeapons(node),
        ])
        .then(() => {
            return this.loader.loadSceneByName(entrypoint);
        })
        .then(scene => {
            game.setScene(scene);
        });
    }

    parseAudio(node) {
        const audioNodes = find(node, 'audio > *');
        return Promise.all(audioNodes.map(node => {
            return this.getAudio(node)
            .then(audio => {
                const id = this.getAttr(node, 'id');
                this.loader.resourceManager.addAudio(id, audio);
            });
        }));
    }

    parseConfig(node) {
        const configNodes = children(node, 'config');
        configNodes.forEach(node => {
            const textureScale = this.getInt(node, 'texture-scale');
            if (textureScale) {
                this.loader.textureScale = textureScale;
            }
        });
    }

    parseFonts(node) {
        const fontNodes = find(node, 'fonts > font');
        return Promise.all(fontNodes.map(node => {
            const url = this.resolveURL(node, 'url');
            this.loader.resourceLoader.loadImage(url)
            .then(canvas => {
                const fontId = this.getAttr(node, 'id');
                const size = this.getVector2(node, 'w', 'h');
                const map = node.getElementsByTagName('map')[0].textContent;

                const font = new BitmapFont(map, size, canvas);
                font.scale = this.loader.textureScale;

                const createTextTexture = function createTextTexture(text) {
                    return font.createText(text);
                };

                this.loader.resourceManager.addFont(fontId, createTextTexture);
            });
        }));
    }

    parseEntities(nodes) {
        const resource = this.loader.resourceManager;
        return Promise.all(nodes.map(node => {
            return this.loader.followNode(node)
            .then(node => this.entityParser.getObjects(node))
            .then(objects => {
                Object.keys(objects).forEach(id => {
                    const object = objects[id];
                    resource.addEntity(id, object.constructor);
                });
            });
        }));
    }

    parsePlayer(node, player) {
        const playerNode = children(node, 'player')[0];
        const characterId = playerNode.querySelector('character')
                                      .getAttribute('id');

        player.defaultWeapon = playerNode.querySelector('weapon')
                                         .getAttribute('default');

        return this.loader.resourceManager.get('entity', characterId)
        .then(Character => {
            const character = new Character();
            player.retries = this.getInt(playerNode, 'retries') || 3;
            player.setCharacter(character);
        });
    }

    parseScenes(node) {
        const nodes = find(node, 'scenes > scene');
        const index = this.loader.sceneIndex;
        nodes.forEach(node => {
            const name = this.getAttr(node, 'name');
            index[name] = {
                'url': this.loader.resolveURL(node, 'src'),
            };
        });
    }

    parseWeapons(node) {
        const weaponsNodes = children(node, 'weapons');
        return Promise.all([...weaponsNodes].map(node => {
            return this.weaponParser.parse(node)
            .then(weapons => {
                const player = this.loader.game.player;
                Object.keys(weapons).forEach((key) => {
                    const weaponInstance = new weapons[key];
                    player.weapons[weaponInstance.code] = weaponInstance;
                });
            });
        }));
    }
}

module.exports = GameParser;
