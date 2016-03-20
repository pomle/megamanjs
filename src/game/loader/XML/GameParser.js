Game.Loader.XML.Parser.GameParser = function(loader)
{
    Game.Loader.XML.Parser.call(this, loader);
}

Engine.Util.extend(Game.Loader.XML.Parser.GameParser,
                   Game.Loader.XML.Parser);

Game.Loader.XML.Parser.GameParser.prototype.parseGame = function(gameNode)
{
    if (!gameNode.is('game')) {
        throw new TypeError('Node not <game>');
    }

    var loader = this.loader;
    var game = loader.game;

    return new Promise(function(resolve) {
        var configNode = gameNode.find('> config');
        loader.resource.textureScale = parseFloat(configNode.attr('texture-scale'))
                                    || this.game.resource.textureScale;

        var weaponParser = new Game.Loader.XML.Parser.WeaponParser(this.loader);
        gameNode.find('> weapons > weapon').each(function() {
            var weaponNode = $(this);
            var weapon = weaponParser.parseWeapon(weaponNode);
            loader.resource.addAuto(weaponNode.attr('id'), weapon);
            var weapon = new weapon();
            loader.game.player.weapons[weapon.code] = weapon;
        });

        gameNode.find('> scenes > scene').each(function() {
            var sceneNode = $(this);
            loader.sceneIndex[sceneNode.attr('name')] = {
                'url': loader.getAbsoluteUrl(sceneNode, 'src'),
            };
        });

        var entryPointParse = function()
        {
            gameNode.find('> level').each(function() {
                levelNode = $(this);
                Game.scenes.Level.prototype.assets['level-start-text']
                    = Engine.SpriteManager.createTextSprite(levelNode.attr('start-caption'));
            });

            var entrySceneName = gameNode.find('> entrypoint > scene').attr('name');
            loader.startScene(entrySceneName);
        }

        var playerNode = gameNode.find('> player');
        var playerCharacterId = playerNode.find('> character').attr('id');
        game.player.defaultWeapon = playerNode.find('> weapon').attr('default');

        var characterReady = function(characterId)
        {
            if (characterId !== playerCharacterId) {
                return;
            }

            var character = new (loader.resource.get('character', characterId))();
            character.invincibility.duration = parseFloat(playerNode.find('> invincibility').attr('duration'));
            game.player.setCharacter(character);

            entryPointParse();
            resolve();
        }

        gameNode.find('> characters > objects').each(function() {
            var objectsNode = $(this);
            var objectParser = new Game.Loader.XML.Parser.ObjectParser(loader);
            loader.followNode(objectsNode).then(function(node) {
                var characters = objectParser.parse(node);
                for (var characterId in characters) {
                    loader.resource.addAuto(characterId, characters[characterId]);
                    characterReady(characterId);
                }
            });
        });
    });
}
