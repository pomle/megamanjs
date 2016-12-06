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
    }
    loadXML(url)
    {
        const parser = new Engine.Loader.XML.Parser();

        const importObjects = this.loader.resourceManager.createImporter('object');

        return this.loader.asyncLoadXML(url).then(doc => {
            const resourceParser = new Engine.Loader.XML.ResourceParser(this.loader);
            const gameNode = doc.querySelector('game');

            return resourceParser.parseGame(gameNode).then(() => {
                const items = gameNode.querySelectorAll(':scope > items > objects');
                return resourceParser.parseObjects(items).then(importObjects);
            })
            .then(() => {
                const characters = gameNode.querySelectorAll(':scope > characters > objects');
                const projectiles = gameNode.querySelectorAll(':scope > projectiles > objects');

                return Promise.all([
                    resourceParser.parseObjects(characters).then(importObjects),
                    resourceParser.parseObjects(projectiles).then(importObjects),
                    new Promise(resolve => {
                        const nodes = gameNode.querySelectorAll(':scope > scenes > scene');
                        const index = this.loader.sceneIndex;
                        for (let node, i = 0; node = nodes[i++];) {
                            const name = parser.getAttr(node, 'name');
                            index[name] = {
                                'url': this.loader.resolveURL(node, 'src'),
                            };
                        }
                        resolve();
                    }),
                ]);
            })
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
            });
        });

    }
    goToScene(name)
    {
        if (!this._sceneIndex[name]) {
            throw new Error(`Scene "${name}" does not exist.`);
        }

        return this.loader.loadScene(this._sceneIndex[name].url);
    }
}
