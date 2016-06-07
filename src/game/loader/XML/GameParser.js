'use strict';

Game.Loader.XML.Parser.GameParser =
class GameParser extends Game.Loader.XML.Parser
{
    parse(gameNode)
    {
        if (gameNode.tagName !== 'game') {
            throw new TypeError('Node not <game>');
        }

        return new Promise(resolve => {
            const configNode = gameNode.querySelector('config');
            const characterNodes = gameNode.querySelectorAll('characters > objects');
            const fontNodes = gameNode.querySelectorAll('fonts > font');
            const itemNodes = gameNode.querySelectorAll('items > objects');
            const projectileNodes = gameNode.querySelectorAll('projectiles > objects');
            const playerNode = gameNode.querySelector('player');
            const sceneNodes = gameNode.querySelectorAll('scenes > scene');
            const weaponsNode = gameNode.querySelectorAll('weapons')[0];

            if (configNode) {
                this.parseConfig(configNode);
            }

            if (sceneNodes) {
                this.parseScenes(sceneNodes);
            }

            const resource = this.loader.resourceManager;
            function addResource(items) {
                Object.keys(items).forEach((key) => {
                    resource.addAuto(key, items[key]);
                });
            }

            const tasks = [];

            const fontTask = this.parseFonts(fontNodes);
            tasks.push(fontTask);


            const mainTask = this.parseObjects(itemNodes)
                .then((items) => {
                    addResource(items);
                })
                .then(() => {
                    return this.parseObjects(characterNodes);
                })
                .then((items) => {
                    addResource(items);
                })
                .then(() => {
                    return this.parseObjects(projectileNodes);
                })
                .then((items) => {
                    addResource(items);
                })
                .then(() => {
                    if (weaponsNode) {
                        const weaponParser = new Game.Loader.XML.Parser.WeaponParser(this.loader);
                        const weapons = weaponParser.parse(weaponsNode);
                        addResource(weapons);
                        Object.keys(weapons).forEach((key) => {
                            const weaponInstance = new weapons[key]();
                            const player = this.loader.game.player;
                            player.weapons[weaponInstance.code] = weaponInstance;
                        });
                    }
                })
                .then(() => {
                    if (playerNode) {
                        this.parsePlayer(playerNode);
                    }
                })
                .then(() => {
                    const entrySceneName = gameNode.querySelector('entrypoint > scene')
                                                   .getAttribute('name');
                    this.loader.entrypoint = entrySceneName;
                });

            tasks.push(mainTask);

            Promise.all(tasks).then(function() {
                resolve();
            })
        });
    }
    parseObjects(objectNodes)
    {
        return new Promise(resolve => {
            const objects = {};
            let pending = 0;
            const objectParser = new Game.Loader.XML.Parser.ObjectParser(this.loader);
            Array.prototype.forEach.call(objectNodes, (objectNode) => {
                ++pending;
                this.loader.followNode(objectNode).then(function(node) {
                    const _objects = objectParser.parse(node);
                    Object.keys(_objects).forEach((objectId) => {
                        if (objects[objectId]) {
                            throw new Error('Object ' + objectId + ' already defined');
                        }
                        objects[objectId] = _objects[objectId];
                    });
                    --pending;
                    if (pending === 0) {
                        resolve(objects);
                    }
                });
            });
            if (pending === 0) {
                resolve(objects);
            }
        });
    }
    parseConfig(configNode)
    {
        return new Promise(resolve => {
            let textureScale = configNode.getAttribute('texture-scale');
            if (textureScale) {
                this.loader.resourceLoader.textureScale = parseFloat(textureScale);
            }
            resolve();
        });
    }
    parseFonts(fontNodes)
    {
        const tasks = [];
        const loader = this.loader;
        for (let fontNode, i = 0; fontNode = fontNodes[i++];) {
            const promise = new Promise((resolve, reject) => {
                const fontId = this.getAttr(fontNode, 'id');
                const url = this.resolveURL(fontNode, 'url');
                const size = this.getVector2(fontNode, 'w', 'h');
                const map = fontNode.getElementsByTagName('map')[0].textContent;
                const image = new Image();
                image.addEventListener('load', function() {
                    const font = new Engine.BitmapFont(map, size, this);
                    font.scale = loader.resourceLoader.textureScale;
                    loader.resourceManager.addFont(fontId, function(text) {
                        return font.createText(text);
                    });
                    resolve();
                });
                image.addEventListener('error', reject);
                image.src = url;
            });
            tasks.push(promise);
        }
        return Promise.all(tasks);
    }
    parsePlayer(playerNode)
    {
        return new Promise(resolve => {
            const player = this.loader.game.player;
            const characterId = playerNode.querySelector('character')
                                          .getAttribute('id');

            player.defaultWeapon = playerNode.querySelector('weapon')
                                             .getAttribute('default');

            const Character = this.loader.resourceManager.get('character', characterId);
            const character = new Character();

            const invincibilityNode = playerNode.querySelector('invincibility');

            player.setCharacter(character);
        });
    }
    parseScenes(sceneNodes)
    {
        return new Promise(resolve => {
            Array.prototype.forEach.call(sceneNodes, (sceneNode) => {
                const name = sceneNode.getAttribute('name');
                this.loader.sceneIndex[name] = {
                    'url': this.loader.resolveURL(sceneNode, 'src'),
                };
            });
            resolve();
        });
    }
}
