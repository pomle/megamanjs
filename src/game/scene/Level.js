Game.scenes.Level = function(game, world)
{
    Game.Scene.apply(this, arguments);
    this.debug = false;

    this.world.camera.camera.position.z = 150;

    this.cameraFollowOffset = new THREE.Vector2(0, 25);
    this.checkPoints = [];
    this.checkPointIndex = 0;
    this.checkPointOffset = new THREE.Vector2(0, 200);

    this.inputs = {
        character: this.createCharacterInput(),
        menu: this.createMenuInput(),
    };

    this.deathCountdown = 0;
    this.deathRespawnTime = 4;

    this.readyBlinkInterval = 9/60;
    this.readyCountdown = 0;
    this.readySpawnTime = 2;

    var engine = game.engine;
    var level = this;

    this.resetPlayer = this.resetPlayer.bind(this);
    this.renderListener = this.renderListener.bind(this);
    this.simulateListener = this.simulateListener.bind(this);

    this.events.bind(this.EVENT_START, this.resetPlayer);
    this.events.bind(this.EVENT_CREATE, function() {
       engine.events.bind(engine.EVENT_RENDER, level.renderListener);
       engine.events.bind(engine.EVENT_SIMULATE, level.simulateListener);
    });
    this.events.bind(this.EVENT_DESTROY, function() {
       engine.events.unbind(engine.EVENT_RENDER, level.renderListener);
       engine.events.unbind(engine.EVENT_SIMULATE, level.simulateListener);
    });
}

Engine.Util.extend(Game.scenes.Level, Game.Scene);

Game.scenes.Level.prototype.assets = {};

Game.scenes.Level.prototype.addCheckPoint = function(x, y, r)
{
    this.checkPoints.push({
        'pos': new THREE.Vector2(x, y),
        'radius': r || 100,
    });
}

Game.scenes.Level.prototype.createCharacterInput = function()
{
    var input = new Engine.Keyboard();
    var game = this.game;
    var player = this.game.player;
    var levelrunner = this;
    input.intermittent(input.LEFT,
        function() {
            player.character.move.leftStart();
        },
        function() {
            player.character.move.leftEnd();
        });
    input.intermittent(input.RIGHT,
        function() {
            player.character.move.rightStart();
        },
        function() {
            player.character.move.rightEnd();
        });
    input.intermittent(input.UP,
        function() {
            player.character.move.upStart();
        },
        function() {
            player.character.move.upEnd();
        });
    input.intermittent(input.DOWN,
        function() {
            player.character.move.downStart();
        },
        function() {
            player.character.move.downEnd();
        });


    input.intermittent(input.A,
        function() {
            player.character.jump.engage();
        },
        function() {
            player.character.jump.cancel();
        });
    input.hit(input.B,
        function() {
            player.character.weapon.fire();
        });
    input.hit(input.START,
        function() {
            levelrunner.toggleMenu();
        });
    input.hit(input.SELECT,
        function() {
            levelrunner.__end();
        });

    return input;
}

Game.scenes.Level.prototype.createMenuInput = function()
{
    var input = new Engine.Keyboard();
    return input;
}

Game.scenes.Level.prototype.followPlayer = function()
{
    this.world.camera.follow(this.game.player.character,
                             this.cameraFollowOffset);
}

Game.scenes.Level.prototype.goToCheckpoint = function(index)
{
    this.checkPointIndex = index;
    this.resetPlayer();
}

Game.scenes.Level.prototype.renderListener = function()
{
    if (this.readyCountdown > 0) {
        var readyElapsedTime = this.readyCountdown - this.game.engine.timeElapsedTotal;
        var f = readyElapsedTime % this.readyBlinkInterval;
        this.assets['level-start-text'].visible = f >= this.readyBlinkInterval / 2;
        if (this.game.engine.timeElapsedTotal > this.readyCountdown) {
            this.game.engine.world.scene.remove(this.assets['level-start-text']);
            this.resumeGamePlay();
            this.readyCountdown = 0;
        }
    }
}

Game.scenes.Level.prototype.simulateListener = function()
{
    if (this.deathCountdown === 0 && this.game.player.character.health.depleted) {
        --this.game.player.lives;
        this.deathCountdown = this.game.engine.timeElapsedTotal + this.deathRespawnTime;
    }
    if (this.deathCountdown > 0 && this.game.engine.timeElapsedTotal > this.deathCountdown) {
        if (this.game.player.lives == 0) {
            this.__end();
        }
        else {
            this.resetPlayer();
        }
    }
}

Game.scenes.Level.prototype.spawnCharacter = function(name)
{
    var character = new Game.objects.characters[name]();
    var player = this.game.player.character;
    var distance = {
        x: 32,
        y: 32,
    }
    character.position.x = player.position.x + (player.direction > 0 ? distance.x : -distance.x);
    character.position.y = player.position.y + distance.y;
    this.world.addObject(character);
    return character;
}

Game.scenes.Level.prototype.pauseGamePlay = function()
{
    this.inputs.character.disable();
    this.inputs.menu.enable();
    this.game.engine.isSimulating = false;
}

Game.scenes.Level.prototype.resumeGamePlay = function()
{
    this.inputs.menu.disable();
    this.inputs.character.enable();
    this.game.engine.isSimulating = true;
}

Game.scenes.Level.prototype.resetCheckpoint = function()
{
    this.readyCountdown = this.game.engine.timeElapsedTotal + this.readySpawnTime;

    this.assets['level-start-text'].position.x = this.world.camera.camera.position.x;
    this.assets['level-start-text'].position.y = this.world.camera.camera.position.y;

    this.game.engine.world.scene.add(this.assets['level-start-text']);
    this.game.engine.world.updateTime(0);
}

Game.scenes.Level.prototype.resetPlayer = function()
{
    this.deathCountdown = 0;
    this.pauseGamePlay();
    this.game.player.equipWeapon('p');
    var character = this.game.player.character;

    this.world.removeObject(character);

    character.isPlayer = true;
    character.resurrect();
    character.invincibility.disengage();
    character.stun.disengage();

    var checkpoint = this.checkPoints[this.checkPointIndex];
    if (this.debug) {
        character.moveTo(checkpoint.pos);
        this.resumeGamePlay();
    }
    else if (checkpoint) {
        var startPosition = checkpoint.pos.clone();
        var playerPosition = checkpoint.pos.clone().add(this.checkPointOffset);
        var cameraPosition = checkpoint.pos.clone().add(this.cameraFollowOffset);
        character.moveTo(playerPosition);
        character.teleport.to(startPosition);
        this.world.camera.jumpToPath(cameraPosition);

        var level = this;
        var startFollow = function() {
            level.followPlayer();
            this.unbind(this.teleport.EVENT_END, arguments.callee);
        }
        character.bind(character.teleport.EVENT_END, startFollow);
        this.resetCheckpoint();
    }
    else {
        character.moveTo(new THREE.Vector2(0, 0));
        this.world.camera.follow(character);
        this.resumeGamePlay();
    }

    this.world.addObject(character);
}
