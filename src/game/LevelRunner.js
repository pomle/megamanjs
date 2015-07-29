Game.LevelRunner = function(game, level)
{
    if (game instanceof Game === false) {
        throw new Error('Invalid game');
    }
    if (level instanceof Engine.scenes.Level === false) {
        throw new Error('Invalid level');
    }


    this.assets = {
        "ready": Engine.SpriteManager.createTextSprite("READY"),
    };


    this.cameraFollowOffset = new THREE.Vector2(0, 25);
    this.checkPointIndex = 0;
    this.checkPointOffset = new THREE.Vector2(0, 200);
    this.game = game;
    this.level = level;

    this.inputs = {
        character: this.createCharacterInput(),
        menu: this.createMenuInput(),
    };

    this.game.engine.scene = this.level;

    this.deathCountdown = 0;
    this.deathRespawnTime = 4;

    this.readyBlinkInterval = 9/60;
    this.readyCountdown = 0;
    this.readySpawnTime = 2;

    this.game.engine.events.simulate.push(this.simulateListener.bind(this));
    this.game.engine.events.render.push(this.renderListener.bind(this));

    this.resetPlayer();
}

Game.LevelRunner.prototype.createCharacterInput = function()
{
    var input = new Engine.Keyboard();
    var game = this.game;
    var player = this.game.player;
    var levelrunner = this;
    input.intermittent(input.LEFT,
        function() {
            player.character.moveLeftStart();
        },
        function() {
            player.character.moveLeftEnd();
        });
    input.intermittent(input.RIGHT,
        function() {
            player.character.moveRightStart();
        },
        function() {
            player.character.moveRightEnd();
        });

    input.intermittent(input.A,
        function() {
            player.character.jumpStart();
        },
        function() {
            player.character.jumpEnd();
        });
    input.hit(input.B,
        function() {
            player.character.fire();
        });
    input.hit(input.START,
        function() {
            levelrunner.toggleMenu();
        });
    input.hit(input.SELECT,
        function() {
            game.setScene()
        });

    return input;
}

Game.LevelRunner.prototype.createMenuInput = function()
{
    var input = new Engine.Keyboard();
    return input;
}

Game.LevelRunner.prototype.followPlayer = function()
{
    this.level.camera.follow(this.game.player.character,
                             this.cameraFollowOffset);
}

Game.LevelRunner.prototype.renderListener = function()
{
    if (this.readyCountdown > 0) {
        var readyElapsedTime = this.readyCountdown - this.game.engine.timeElapsedTotal;
        var f = readyElapsedTime % this.readyBlinkInterval;
        this.assets.ready.visible = f >= this.readyBlinkInterval / 2;
        if (this.game.engine.timeElapsedTotal > this.readyCountdown) {
            this.game.engine.scene.scene.remove(this.assets.ready);
            this.resumeGamePlay();
            this.readyCountdown = 0;
        }
    }
}

Game.LevelRunner.prototype.simulateListener = function()
{
    if (this.deathCountdown === 0 && this.game.player.character.health.isDepleted()) {
        --this.game.player.lives;
        this.deathCountdown = this.game.engine.timeElapsedTotal + this.deathRespawnTime;
    }
    if (this.deathCountdown > 0 && this.game.engine.timeElapsedTotal > this.deathCountdown) {
        if (this.game.player.lives == 0) {
            this.game.endLevel();
        }
        else {
            this.resetPlayer();
        }
    }
}

Game.LevelRunner.prototype.spawnCharacter = function(name)
{
    var character = new Game.objects.characters[name]();
    var player = this.game.player.character;
    var distance = {
        x: 32,
        y: 32,
    }
    this.level.addObject(character,
                         player.position.x + (player.direction > 0 ? distance.x : -distance.x),
                         player.position.y + distance.y);
    return character;
}

Game.LevelRunner.prototype.startGamePlay = function()
{
    this.game.engine.run();
}

Game.LevelRunner.prototype.pauseGamePlay = function()
{
    this.inputs.character.disable();
    this.inputs.menu.enable();
    this.game.engine.isSimulating = false;
}

Game.LevelRunner.prototype.resumeGamePlay = function()
{
    this.inputs.menu.disable();
    this.inputs.character.enable();
    this.game.engine.isSimulating = true;
}

Game.LevelRunner.prototype.resetCheckpoint = function()
{
    this.readyCountdown = this.game.engine.timeElapsedTotal + this.readySpawnTime;

    this.assets.ready.position.x = this.level.camera.camera.position.x;
    this.assets.ready.position.y = this.level.camera.camera.position.y;

    this.game.engine.scene.scene.add(this.assets.ready);
    this.game.engine.scene.updateTime(0);
}

Game.LevelRunner.prototype.resetPlayer = function()
{
    this.deathCountdown = 0;
    this.pauseGamePlay();
    this.game.player.equipWeapon('p');
    var character = this.game.player.character;

    this.level.removeObject(character);

    character.isPlayer = true;
    character.resurrect();
    character.invincibilityEnd();
    character.stunnedTime = 0;

    var checkpoint = this.level.checkPoints[this.checkPointIndex];
    if (checkpoint) {
        var startPosition = checkpoint.pos.clone();
        var playerPosition = checkpoint.pos.clone().add(this.checkPointOffset);
        var cameraPosition = checkpoint.pos.clone().add(this.cameraFollowOffset);
        character.moveTo(playerPosition);
        character.teleport.to(startPosition);
        this.level.camera.jumpToPath(cameraPosition);

        var game = this.game;
        var startFollow = function(character) {
            game.level.followPlayer();
            character.unbind('teleport-end', arguments.callee);
        };
        character.bind('teleport-end', startFollow);
        this.resetCheckpoint();
    }
    else {
        character.moveTo(new THREE.Vector2(0, 0));
        this.level.camera.follow(character);
        this.resumeGamePlay();
    }

    this.level.addObject(character);
}
