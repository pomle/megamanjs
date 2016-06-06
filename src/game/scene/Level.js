'use strict';

Game.scenes.Level = class Level extends Game.Scene
{
    constructor()
    {
        super();

        this.assets = {};
        this.player = null;
        this.world.camera.camera.position.z = 150;

        this.cameraFollowOffset = new THREE.Vector2(0, 25);
        this.checkPoints = [];
        this.checkPointIndex = 0;
        this.checkPointOffset = new THREE.Vector2(0, 200);

        this.assets = {};

        this.deathCountdown = 0;
        this.deathRespawnTime = 4;

        this.resetPlayer = this.resetPlayer.bind(this);
        this.simulateListener = this.simulateListener.bind(this);

        this.events.bind(this.EVENT_CREATE, (game) => {
            this.inputs = {
                character: this.createCharacterInput(game),
                menu: this.createMenuInput(game),
            };
            this.player = game.player;
        });
        this.events.bind(this.EVENT_START, () => {
            this.resetPlayer();
        });
   }
    __destroy()
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
    addCheckPoint(x, y, r)
    {
        this.checkPoints.push({
            'pos': new THREE.Vector2(x, y),
            'radius': r || 100,
        });
    }
    createCharacterInput(game)
    {
        var input = new Engine.Keyboard(),
            player = game.player,
            levelrunner = this,
            aim = player.character.aim;

        input.intermittent(input.LEFT,
            function() {
                aim.x = -1;
            },
            function() {
                if (aim.x === -1) {
                    aim.x = 0;
                }
            });
        input.intermittent(input.RIGHT,
            function() {
                aim.x = 1;
            },
            function() {
                if (aim.x === 1) {
                    aim.x = 0;
                }
            });
        input.intermittent(input.UP,
            function() {
                aim.y = 1;
            },
            function() {
                if (aim.y === 1) {
                    aim.y = 0;
                }
            });
        input.intermittent(input.DOWN,
            function() {
                aim.y = -1;
            },
            function() {
                if (aim.y === -1) {
                    aim.y = 0;
                }
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
    createMenuInput()
    {
        var input = new Engine.Keyboard();
        return input;
    }
    detectCheckpoint()
    {
        var playerPosition = this.player.character.position;
        for (var i = 0, l = this.checkPoints.length; i < l; ++i) {
            var checkpoint = this.checkPoints[i];
            if (checkpoint.pos.distanceTo(playerPosition) < checkpoint.radius) {
                this.checkPointIndex = i;
                return checkpoint;
            }
        }
        return false;
    }
    detectDeath()
    {
        if (this.deathCountdown === 0 && this.player.character.health.depleted) {
            --this.player.lives;
            this.deathCountdown = this.game.engine.realTimePassed + this.deathRespawnTime;
        } else if (this.deathCountdown > 0 && this.game.engine.realTimePassed >= this.deathCountdown) {
            if (this.player.lives <= 0) {
                this.__end();
            } else {
                this.resetPlayer();
            }
        }
    }
    followPlayer()
    {
        this.world.camera.follow(this.player.character,
                                 this.cameraFollowOffset);
    }
    goToCheckpoint(index)
    {
        this.checkPointIndex = index;
        this.resetPlayer();
    }
    readyBlink()
    {
        var interval = 9/60,
            duration = 2,
            elapsed = 0,
            model = this.assets['start-caption'],
            timer = this.timer,
            level = this,
            camera = level.world.camera.camera;

        return new Promise(resolve => {
            if (!model) {
                return resolve();
            }

            model.visible = true;

            function blink(dt) {
                if (elapsed > duration) {
                    level.world.scene.remove(model);
                    timer.events.unbind(timer.EVENT_TIMEPASS, blink);
                    resolve();
                }
                else {
                    model.position.x = camera.position.x;
                    model.position.y = camera.position.y;
                    model.visible = elapsed % (interval * 2) < interval;
                    elapsed += dt;
                }
            }

            level.world.scene.add(model);
            timer.events.bind(timer.EVENT_TIMEPASS, blink);
        });
    }
    simulateListener()
    {
        this.detectDeath();
        this.detectCheckpoint();
    }
    pauseGamePlay()
    {
        var timer = this.timer;
        timer.events.unbind(timer.EVENT_SIMULATE, this.simulateListener);

        this.input = this.inputs.menu;
        timer.isSimulating = false;
    }
    resumeGamePlay()
    {
        var timer = this.timer;
        timer.events.bind(timer.EVENT_SIMULATE, this.simulateListener);

        this.input = this.inputs.character;
        timer.isSimulating = true;
    }
    resetCheckpoint()
    {
        this.resetObjects();
        this.world.updateTime(0);
        return this.readyBlink().then(() => {
            this.resumeGamePlay();
        });
    }
    resetObjects()
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
    resetPlayer()
    {
        var player = this.player,
            character = player.character;

        this.deathCountdown = 0;

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
            camera.velocity.set(0, 0, 0);

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
            this.resetCheckpoint().then(() => {
                this.world.addObject(character);
            });
        }
        else {
            character.moveTo(new THREE.Vector2(0, 0));
            this.world.camera.follow(character);
            this.world.addObject(character);
        }
    }
}
