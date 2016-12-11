'use strict';

class Megaman2
{
    constructor()
    {
        this.game = new Engine.Game();
        this.loader = new Engine.Loader.XML(this.game);

        this.player = new Engine.Player();
        this.state = Object.create(null);

        this._sceneIndex = Object.create(null);

        this.activeScene = null;
    }
    loadXML(url)
    {
        return this.loader.resourceLoader.loadXML(url)
            .then(([gameNode]) => this.parseGameNode(gameNode));
    }
    goToScene(name)
    {
        if (!this._sceneIndex[name]) {
            throw new Error(`Scene "${name}" does not exist.`);
        }

        const url = this._sceneIndex[name].url;

        return this.loader.resourceLoader.loadXML(url)
        .then(([sceneNode]) => {
            return this.parseSceneNode(sceneNode);
        })
        .then(scene => {
            this.game.setScene(scene.scene);
            this.activeScene = scene;
        });
    }

    parseGameNode(gameNode) {
        const configTask = gameNode.find(':scope > config')
        .then(([configNode]) => {
            const scaleAttr = configNode.attr('texture-scale');
            if (scaleAttr) {
                this.loader.textureScale = scaleAttr.toFloat();
            }
        })
        .then(() => {
            const resourceTask = gameNode.find(':scope > resources')
            .then(([resourcesNode]) => {
                const resourceParser = new Engine.Loader.XML
                    .ResourceParser(this.loader);
                return resourceParser.parseResourcesNode(resourcesNode);
            });

            const sceneIndexTask = gameNode.find(':scope > scenes > scene')
            .then(sceneNodes => {
                sceneNodes.forEach(sceneNode => {
                    const name = sceneNode.attr('name').value;
                    this._sceneIndex[name] = {
                        url: sceneNode.attr('url').toURL(),
                    };
                });
            });

            return Promise.all([
                resourceTask,
                sceneIndexTask,
            ]);
        })
        .then(() => gameNode.find(':scope > entrypoint'))
        .then(([entrypointNode]) => {
            const scene = entrypointNode.attr('scene').value;
            this.goToScene(scene);
        });
        /*
        .then(() => {
            const playerNode = gameNode.querySelector('player');
            const player = this.loader.game.player;
            const characterId = playerNode.querySelector('character')
                                          .getAttribute('id');

            player.defaultWeapon = playerNode.querySelector('weapon')
                                             .getAttribute('default');

            const Character = this.loader.resourceManager.get('object', characterId);
            const character = new Character;

            const invincibilityNode = playerNode.querySelector('invincibility');

            player.retries = parseFloat(playerNode.getAttribute('retries')) || 3;
            player.setCharacter(character);
        })
        .then(() => {
            const weaponsNode = gameNode.querySelector(':scope > weapons');
            if (weaponsNode) {
                const weaponParser = new Megaman2.WeaponParser(this.loader);
                const weapons = weaponParser.parse(weaponsNode);
                const player = this.loader.game.player;
                Object.keys(weapons).forEach(key => {
                    const weaponInstance = new weapons[key];
                    player.weapons[weaponInstance.code] = weaponInstance;
                });
            }
        })
        .then(() => {
            const entrypoint= gameNode.querySelector(':scope > entrypoint');
            megaman2.goToScene(entrypoint);
            return megaman2;
        });*/

    }

    parseSceneNode(node) {
        const type = node.node.tagName;
        if (type) {
            if (type === 'level') {
                const parser = new Engine.Loader.XML.LevelParser(this.loader, node.node);
                return parser.getScene();
            } else if (type === 'stage-select') {
                const parser = new Megaman2.StageSelectParser(this.loader, node);
                return parser.getScene();
            } else {
                throw new Error(`Scene type "${type}" not recognized`);
            }
        } else {
            const parser = new Engine.Loader.XML.SceneParser(this, node);
            return parser.getScene();
        }
    }
}
