Game.scenes.Level = function(game, world)
{
    Game.Scene.apply(this, arguments);

    this.world.camera.camera.position.z = 150;

    this.cameraFollowOffset = new THREE.Vector2(0, 25);
    this.checkPoints = [];
    this.checkPointIndex = 0;
    this.checkPointOffset = new THREE.Vector2(0, 200);

    this.assets = {};

    this.inputs = {
        character: this.createCharacterInput(),
        menu: this.createMenuInput(),
    };

    this.deathCountdown = 0;
    this.deathRespawnTime = 4;

    var engine = game.engine;
    var level = this;

    this.resetPlayer = this.resetPlayer.bind(this);
    this.simulateListener = this.simulateListener.bind(this);

    this.events.bind(this.EVENT_START, this.resetPlayer);
    this.events.bind(this.EVENT_END, function() {
        level.pauseGamePlay();
        engine.isSimulating = true;
    });
}

Engine.Util.extend(Game.scenes.Level, Game.Scene);

Game.scenes.Level.prototype.assets = {};

Game.scenes.Level.prototype.__destroy = function()
{
    this.world.camera.unfollow();
    for (var objects = this.world.objects, i = 0, l = objects.length; i !== l; ++i) {
        var object = objects[i];
        if (object !== undefined) {
            this.world.removeObject(object);
        }
    }
    Game.Scene.prototype.__destroy.apply(this, arguments);
}

Game.scenes.Level.prototype.addCheckPoint = function(x, y, r)
{
    this.checkPoints.push({
        'pos': new THREE.Vector2(x, y),
        'radius': r || 100,
    });
}

Game.scenes.Level.prototype.createCharacterInput = function()
{
    var input = new Engine.Keyboard(),
        game = this.game,
        player = this.game.player,
        levelrunner = this;

    input.intermittent(input.LEFT,
        function() {
            --player.character.aim.x;
        },
        function() {
            ++player.character.aim.x;
        });
    input.intermittent(input.RIGHT,
        function() {
            ++player.character.aim.x;
        },
        function() {
            --player.character.aim.x;
        });
    input.intermittent(input.UP,
        function() {
            ++player.character.aim.y;
        },
        function() {
            --player.character.aim.y;
        });
    input.intermittent(input.DOWN,
        function() {
            --player.character.aim.y;
        },
        function() {
            ++player.character.aim.y;
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
            //levelrunner.toggleMenu();
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

Game.scenes.Level.prototype.detectCheckpoint = function()
{
    var playerPosition = this.game.player.character.position;
    for (var i = 0, l = this.checkPoints.length; i < l; ++i) {
        var checkpoint = this.checkPoints[i];
        if (checkpoint.pos.distanceTo(playerPosition) < checkpoint.radius) {
            this.checkPointIndex = i;
            return checkpoint;
        }
    }
    return false;
}

Game.scenes.Level.prototype.detectDeath = function()
{
    if (this.deathCountdown === 0 && this.game.player.character.health.depleted) {
        --this.game.player.lives;
        this.deathCountdown = this.game.engine.realTimePassed + this.deathRespawnTime;
    } else if (this.deathCountdown > 0 && this.game.engine.realTimePassed >= this.deathCountdown) {
        if (this.game.player.lives <= 0) {
            this.__end();
        } else {
            this.resetPlayer();
        }
    }
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

Game.scenes.Level.prototype.readyBlink = function(callback)
{
    var interval = 9/60,
        duration = 2,
        elapsed = 0,
        model = this.assets['start-caption'],
        engine = this.game.engine,
        level = this;

    if (!model) {
        return callback();
    }

    function blink(dt) {
        if (elapsed > duration) {
            level.world.scene.remove(model);
            engine.events.unbind(engine.EVENT_TIMEPASS, blink);
            if (callback) {
                callback();
            }
        }
        else {
            model.position.x = level.world.camera.camera.position.x;
            model.position.y = level.world.camera.camera.position.y;
            model.visible = elapsed % (interval * 2) < interval;
            elapsed += dt;
        }
    }

    level.world.scene.add(model);
    engine.events.bind(engine.EVENT_TIMEPASS, blink);
}

Game.scenes.Level.prototype.simulateListener = function()
{
    this.detectDeath();
    this.detectCheckpoint();
}

Game.scenes.Level.prototype.spawnCharacter = function(name)
{
    var c = this.game.resource.get('character', name);
    if (!c) {
        throw new Error('Character "' + name + '" does not exist');
    }

    var character = new c();
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
    var engine = this.game.engine;
    engine.events.unbind(engine.EVENT_SIMULATE, this.simulateListener);

    this.input = this.inputs.menu;
    this.game.engine.isSimulating = false;
}

Game.scenes.Level.prototype.resumeGamePlay = function()
{
    var engine = this.game.engine;
    engine.events.bind(engine.EVENT_SIMULATE, this.simulateListener);

    this.input = this.inputs.character;
    this.game.engine.isSimulating = true;
}

Game.scenes.Level.prototype.resetCheckpoint = function()
{
    var level = this;
    this.resetObjects();

    this.readyBlink(function() {
        level.resumeGamePlay();
    });
    this.game.engine.world.updateTime(0);
}

Game.scenes.Level.prototype.resetObjects = function()
{
    var objects = this.world.objects;
    for (var i = 0, l = objects.length; i !== l; ++i) {
        if (objects[i] === undefined) {
            continue;
        }
        var object = objects[i];
        for (var j = 0, k = object.traits.length; j !== k; ++j) {
            var trait = object.traits[j];
            if (typeof trait.reset === 'function') {
                trait.reset();
            }
        }
    }
}

Game.scenes.Level.prototype.resetPlayer = function()
{
    var player = this.game.player,
        character = player.character;

    this.deathCountdown = 0;
    this.pauseGamePlay();

    if (player.defaultWeapon) {
        player.equipWeapon(player.defaultWeapon);
    }

    this.world.removeObject(character);

    character.resurrect();
    if (character.invincibility) {
        character.invincibility.disengage();
    }
    if (character.stun) {
        character.stun.disengage();
    }
    character.integrator.reset();

    var checkpoint = this.checkPoints[this.checkPointIndex];
    if (checkpoint) {
        var startPosition = checkpoint.pos.clone();
        var playerPosition = checkpoint.pos.clone().add(this.checkPointOffset);
        var cameraPosition = checkpoint.pos.clone().add(this.cameraFollowOffset);
        var camera = this.world.camera;

        character.moveTo(playerPosition);
        character.teleport.to(startPosition);
        camera.unfollow();
        camera.jumpToPath(cameraPosition);

        var level = this;
        var startFollow = function() {
            camera.follow(character);
            this.events.unbind(this.teleport.EVENT_END, startFollow);
        }
        character.events.bind(character.teleport.EVENT_END, startFollow);
        this.resetCheckpoint();
    }
    else {
        character.moveTo(new THREE.Vector2(0, 0));
        this.world.camera.follow(character);
        this.resumeGamePlay();
    }

    this.world.addObject(character);
}
