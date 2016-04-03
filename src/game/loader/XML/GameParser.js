'use strict';

Game.Loader.XML.Parser.GameParser = function(loader)
{
    Game.Loader.XML.Parser.call(this, loader);
}

Engine.Util.extend(Game.Loader.XML.Parser.GameParser,
                   Game.Loader.XML.Parser);

Game.Loader.XML.Parser.GameParser.prototype.parse = function(gameNode)
{
    if (gameNode.tagName !== 'game') {
        throw new TypeError('Node not <game>');
    }

    return new Promise((resolve) => {
        const configNode = gameNode.querySelector('config');
        if (configNode) {
            this.parseConfig(configNode);
        }

        const weaponNodes = gameNode.querySelectorAll('weapons > weapon');
        if (weaponNodes) {
            this.parseWeapons(weaponNodes);
        }

        const sceneNodes = gameNode.querySelectorAll('scenes > scene');
        if(sceneNodes) {
            this.parseScenes(sceneNodes);
        }

/*
function characterReady(characterId) {
            if (characterId !== playerCharacterId) {
                return;
            }



            entryPointParse();
        }


        */
        const characterNodes = gameNode.querySelectorAll('characters objects');
        this.parseCharacters(characterNodes)
            .then((characters) => {
                Object.keys(characters).forEach((key) => {
                    this.loader.resource.addAuto(key, characters[key]);
                });
            })
            .then(() => {
                const playerNode = gameNode.querySelector('player');
                if (playerNode) {
                    this.parsePlayer(playerNode);
                }
            })
            .then(() => {
                const entrySceneName = gameNode.querySelector('entrypoint > scene')
                                               .getAttribute('name');
                this.loader.startScene(entrySceneName);
            });
    });
}

Game.Loader.XML.Parser.GameParser.prototype.parseCharacters = function(characterNodes) {
    return new Promise((resolve) => {
        const characters = {};
        let pending = 0;
        const objectParser = new Game.Loader.XML.Parser.ObjectParser(this.loader);
        Array.prototype.forEach.call(characterNodes, (characterNode) => {
            ++pending;
            this.loader.followNode(characterNode).then(function(node) {

                const _characters = objectParser.parse(node);
                Object.keys(_characters).forEach((characterId) => {
                    if (characters[characterId]) {
                        throw new Error('Character ' + characterId + ' already defined');
                    }
                    characters[characterId] = _characters[characterId];
                });
                --pending;
                if (pending === 0) {
                    resolve(characters);
                }
            });
        });
        if (pending === 0) {
            resolve(characters);
        }
    });
}

Game.Loader.XML.Parser.GameParser.prototype.parseConfig = function(configNode) {
    return new Promise((resolve) => {
        let textureScale = configNode.getAttribute('texture-scale');
        if (textureScale) {
            this.loader.resource.textureScale = parseFloat(textureScale);
        }
        resolve();
    });
}

Game.Loader.XML.Parser.GameParser.prototype.parsePlayer = function(playerNode) {
    return new Promise((resolve) => {
        const player = this.loader.game.player;
        const characterId = playerNode.querySelector('character')
                                      .getAttribute('id');

        player.defaultWeapon = playerNode.querySelector('weapon')
                                         .getAttribute('default');

        const Character = this.loader.resource.get('character', characterId);
        const character = new Character();

        const invincibilityNode = playerNode.querySelector('invincibility');

        player.setCharacter(character);
    });
}

Game.Loader.XML.Parser.GameParser.prototype.parseScenes = function(sceneNodes) {
    return new Promise((resolve) => {
        Array.prototype.forEach.call(sceneNodes, (sceneNode) => {
            const name = sceneNode.getAttribute('name');
            this.loader.sceneIndex[name] = {
                'url': this.loader.resolveURL(sceneNode, 'src'),
            };
        });
        resolve();
    });
}

Game.Loader.XML.Parser.GameParser.prototype.parseWeapons = function(weaponNodes) {
    return new Promise((resolve) => {
        const weaponParser = new Game.Loader.XML.Parser.WeaponParser(this.loader);
        Array.prototype.forEach.call(weaponNodes, (weaponNode) => {
            const Weapon = weaponParser.parse(weaponNode);
            const weaponId = weaponNode.getAttribute('id');
            const weaponInstance = new Weapon();
            this.loader.resource.addAuto(weaponId, Weapon);
            this.loader.game.player.weapons[weaponInstance.code] = weaponInstance;
        });
        resolve();
    });
}
