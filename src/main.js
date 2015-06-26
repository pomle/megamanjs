var Megaman = function()
{
    this.engine = undefined;
    this.player = undefined;
    this.level = undefined;

    window.addEventListener('focus', function() {
        if (this.engine && !this.engine.isRunning) {
            this.engine.run();
        }
    }.bind(this));
    window.addEventListener('blur', function() {
        if (this.engine && this.engine.isRunning) {
            this.engine.pause();
        }
    }.bind(this));
}

Megaman.createFromXML = function(gameXml, baseUrl)
{
    var baseUrl = baseUrl || '';
    var renderer = new THREE.WebGLRenderer();
    renderer.setSize(800, 532);
    document.getElementById('screen').appendChild(renderer.domElement);

    var game = new Megaman();
    game.engine = new Engine(renderer);

    game.player = new Megaman.Player();
    game.player.hud = new Hud($('#screen'));

    gameXml.find('> weapons > weapon').each(function() {
        var weaponXml = $(this);
        var code = weaponXml.attr('code');
        var name = weaponXml.attr('name');

        if (!Engine.assets.weapons[name]) {
            throw new Error('Weapon ' + name + ' does not exist');
        }
        var weapon = new Engine.assets.weapons[name]();
        weapon.code = code;
        game.player.weapons[code] = weapon;
    });

    game.player.setCharacter(new Engine.assets.objects.characters.Megaman());
    game.player.hud.equipCharacter(game.player.character);
    game.player.character.invincibilityDuration = 2;
    game.player.input = new Engine.Keyboard();
    game.player.equipWeapon('p');

    game.player.input.intermittent(65,
        function() {
            game.player.character.moveLeftStart();
        },
        function() {
            game.player.character.moveLeftEnd();
        });
    game.player.input.intermittent(68,
        function() {
            game.player.character.moveRightStart();
        },
        function() {
            game.player.character.moveRightEnd();
        });

    game.player.input.intermittent(80,
        function() {
            game.player.character.jumpStart();
        },
        function() {
            game.player.character.jumpEnd();
        });
    game.player.input.hit(79,
        function() {
            game.player.character.fire();
        });
    game.player.input.hit(89,
        function() {
            game.engine.isSimulating = !game.engine.isSimulating;
        });

    game.player.input.hit(33, function() {
        equipWeapon(weaponIndex[++weaponIndex.selected]);
    });
    game.player.input.hit(34, function() {
        equipWeapon(weaponIndex[--weaponIndex.selected]);
    });

    return game;
}
Megaman.loadFromXML = function(url, callback)
{
    Engine.Util.asyncLoadXml(url, function(xml, baseUrl) {
        var gameXml = xml.children('game');
        var game = Megaman.createFromXML(gameXml, baseUrl);
        gameXml.find('> entrypoint > scene').each(function() {
            var sceneXml = $(this);
            var name = sceneXml.attr('name');
            var src = baseUrl + '/' + sceneXml.attr('src');
            if (!Engine.scenes[name]) {
                throw new Error("Scene " + name + " does not exist");
            }
            Engine.scenes[name].loadFromXml(src, function(scene) {
                game.engine.scene = scene;
                callback(game);
            });
        });
    });
}

Megaman.prototype.endLevel = function()
{
    this.engine.pause();
    this.engine.scene = undefined;


}

Megaman.prototype.loadLevel = function(xmlUrl)
{
    this.engine.pause();
    this.engine.scene = undefined;
    Engine.scenes.Level.Util.loadFromXML(xmlUrl, function(level) {
        this.level = new Megaman.LevelRunner(this, level);
        this.level.startGamePlay();
    }.bind(this));
}

Megaman.Player = function()
{
    this.character = undefined;
    this.hud = undefined;
    this.input = undefined;
    this.lifes = 3;
    this.weapons = {};
}

Megaman.Player.prototype.equipWeapon = function(code)
{
    var weapon = this.weapons[code];
    weapon.code = code;
    this.character.equipWeapon(weapon);
    this.hud.equipWeapon(weapon);
}

Megaman.Player.prototype.setCharacter = function(character)
{
    this.character = character;
}

Megaman.LevelRunner = function(game, level)
{
    if (game instanceof Megaman === false) {
        throw new Error('Invalid game');
    }
    if (level instanceof Engine.scenes.Level === false) {
        throw new Error('Invalid level');
    }

    this.checkPointIndex = 0;
    this.game = game;
    this.level = level;
    this.game.engine.scene = this.level;
    this.resetPlayer();

    this.deathCountdown = 0;
    this.deathRespawnTime = 4;

    this.game.engine.events.simulate.push(this.simulateListener.bind(this));
}

Megaman.LevelRunner.prototype.simulateListener = function()
{
    if (this.deathCountdown === 0 && this.game.player.character.health.depleted()) {
        this.game.player.lifes--;
        this.deathCountdown = this.game.engine.timeElapsedTotal + this.deathRespawnTime;
    }
    if (this.deathCountdown > 0 && this.game.engine.timeElapsedTotal > this.deathCountdown) {
        if (this.game.player.lifes == 0) {
            this.game.endLevel();
        }
        else {
            this.resetPlayer();
        }
    }
}

Megaman.LevelRunner.prototype.resetPlayer = function()
{
    this.deathCountdown = 0;
    var player = this.game.player.character;
    player.isPlayer = true;
    player.health.set(player.health.max);
    this.level.removeObject(player);
    this.level.addObject(player,
                    this.level.checkPoints[this.checkPointIndex].pos.x,
                    this.level.checkPoints[this.checkPointIndex].pos.y);
    this.level.camera.follow(this.game.player.character);
}

Megaman.LevelRunner.prototype.startGamePlay = function()
{
    this.game.engine.run();
}


var game;
Megaman.loadFromXML('resource/Megaman2.xml', function(g) {
    game = g;
    game.engine.run();
});


var pendelum = function(dt)
{
    this.momentum.x = Math.sin(this.time) * 20;
    Engine.assets.Object.prototype.timeShift.call(this, dt);
}

var circle = function(dt)
{
    var speed = 100;
    //this.momentum.x = Math.sin(this.time) * speed;
    this.momentum.y = Math.cos(this.time) * speed;
    //this.momentum.x += dt * 100;
    //this.momentum.y += dt;
    Engine.assets.Object.prototype.timeShift.call(this, dt);
}
