'use strict';

Game.Loader.XML.Parser.GameParser =
class GameParser extends Game.Loader.XML.Parser
{
    constructor(loader, node)
    {
        if (!node || node.tagName !== 'game') {
            throw new TypeError('Node not <game>');
        }

        super(loader);

        this._node = node;
    }
    parse()
    {
        const characterNodes = this._node
            .querySelectorAll(':scope > characters > objects');

        const itemNodes = this._node
            .querySelectorAll(':scope > items > objects');

        const projectileNodes = this._node
            .querySelectorAll(':scope > projectiles > objects');

        return this.parseConfig().then(() => {
            return Promise.all([
                this.parseEntrypoint(),
                this.parseFonts(),
                this.parseObjects(itemNodes),
                this.parseObjects(characterNodes),
                this.parseObjects(projectileNodes),
                this.parseScenes(),
            ]);
        }).then(() => {
            return this.parsePlayer();
        }).then(() => {
            return this.parseWeapons();

        });
    }
    parseConfig()
    {
        const configNode = this._node.querySelector(':scope > config');
        const textureScale = this.getInt(configNode, 'texture-scale');
        if (textureScale) {
            this.loader.textureScale = textureScale;
        }
        return Promise.resolve();
    }
    parseEntrypoint()
    {
        const entrypoint= this._node.querySelector(':scope > entrypoint');
        if (entrypoint) {
            this.loader.entrypoint = entrypoint.getAttribute('scene');
        }
        return Promise.resolve();
    }
    parseFonts()
    {
        const nodes = this._node.querySelectorAll(':scope > fonts > font');
        const tasks = [];
        const loader = this.loader;
        for (let node, i = 0; node = nodes[i++];) {
            const url = this.resolveURL(node, 'url');
            const task = loader.resourceLoader.loadImage(url).then(canvas => {
                const fontId = this.getAttr(node, 'id');
                const size = this.getVector2(node, 'w', 'h');
                const map = node.getElementsByTagName('map')[0].textContent;
                const font = new Engine.BitmapFont(map, size, canvas);
                font.scale = loader.textureScale;
                loader.resourceManager.addFont(fontId, function(text) {
                    return font.createText(text);
                });
            });
            tasks.push(task);
        }
        return Promise.all(tasks);
    }
    parseObjects(nodes)
    {
        const tasks = [];
        const objects = {};
        const resource = this.loader.resourceManager;
        for (let node, i = 0; node = nodes[i++];) {
            const task = this.loader.followNode(node)
                .then(node => {
                    const parser = new Game.Loader.XML.Parser.ObjectParser(this.loader, node);
                    return parser.getObjects();
                })
                .then(objects => {
                    Object.keys(objects).forEach(id => {
                        const object = objects[id];
                        resource.addAuto(id, object.constructor);
                    });
                });
            tasks.push(task);
        }
        return Promise.all(tasks);
    }

    parsePlayer()
    {
        const playerNode = this._node.querySelector('player');
        const player = this.loader.game.player;
        const characterId = playerNode.querySelector('character')
                                      .getAttribute('id');

        player.defaultWeapon = playerNode.querySelector('weapon')
                                         .getAttribute('default');

        const Character = this.loader.resourceManager.get('character', characterId);
        const character = new Character;

        const invincibilityNode = playerNode.querySelector('invincibility');

        player.retries = this.getInt(playerNode, 'retries') || 3;
        player.setCharacter(character);

        return Promise.resolve();
    }
    parseScenes()
    {
        const nodes = this._node.querySelectorAll(':scope > scenes > scene');
        const index = this.loader.sceneIndex;
        for (let node, i = 0; node = nodes[i++];) {
            const name = this.getAttr(node, 'name');
            index[name] = {
                'url': this.loader.resolveURL(node, 'src'),
            };
        }
        return Promise.resolve();
    }
    parseWeapons()
    {
        const weaponsNode = this._node.querySelector(':scope > weapons');
        if (weaponsNode) {
            const resource = this.loader.resourceManager;
            const weaponParser = new Game.Loader.XML.Parser.WeaponParser(this.loader);
            const weapons = weaponParser.parse(weaponsNode);
            const player = this.loader.game.player;
            Object.keys(weapons).forEach((key) => {
                resource.addAuto(key, weapons[key]);
                const weaponInstance = new weapons[key];
                player.weapons[weaponInstance.code] = weaponInstance;
            });
        }
    }
}
