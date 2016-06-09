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
    __destroy(game)
    {
        this.world.camera.unfollow();
        this.world.objects.forEach(object => {
            if (object !== undefined) {
                this.world.removeObject(object);
            }
        });
        super.__destroy(game);
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
        const input = new Engine.Keyboard();
        const player = game.player;

        input.intermittent(input.LEFT,
            () => {
                player.character.aim.x = -1;
            },
            () => {
                if (player.character.aim.x === -1) {
                    player.character.aim.x = 0;
                }
            });
        input.intermittent(input.RIGHT,
            () => {
                player.character.aim.x = 1;
            },
            () => {
                if (player.character.aim.x === 1) {
                    player.character.aim.x = 0;
                }
            });
        input.intermittent(input.UP,
            () => {
                player.character.aim.y = 1;
            },
            () => {
                if (player.character.aim.y === 1) {
                    player.character.aim.y = 0;
                }
            });
        input.intermittent(input.DOWN,
            () => {
                player.character.aim.y = -1;
            },
            () => {
                if (player.character.aim.y === -1) {
                    player.character.aim.y = 0;
                }
            });

        input.intermittent(input.A,
            () => {
                player.character.jump.engage();
            },
            () => {
                player.character.jump.cancel();
            });
        input.hit(input.B,
            () => {
                player.character.weapon.fire();
            });
        input.hit(input.START,
            () => {
                //levelrunner.toggleMenu();
            });
        input.hit(input.SELECT,
            () => {
                this.__end();
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
            this.deathCountdown = this.timer.realTimePassed + this.deathRespawnTime;
        } else if (this.deathCountdown > 0 && this.timer.realTimePassed >= this.deathCountdown) {
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
        if (!this.assets['start-caption']) {
            return Promise.resolve();
        }

        const interval = 9/60;
        const duration = 2;
        let elapsed = 0;
        const model = this.assets['start-caption'];
        const camera = level.world.camera.camera;

        return new Promise(resolve => {
            model.visible = true;
            const blink = (dt) => {
                if (elapsed > duration) {
                    this.world.scene.remove(model);
                    this.timer.events.unbind(timer.EVENT_TIMEPASS, blink);
                    resolve();
                } else {
                    model.position.x = camera.position.x;
                    model.position.y = camera.position.y;
                    model.visible = elapsed % (interval * 2) < interval;
                    elapsed += dt;
                }
            };

            this.world.scene.add(model);
            this.timer.events.bind(this.timer.EVENT_TIMEPASS, blink);
        });
    }
    simulateListener()
    {
        this.detectDeath();
        this.detectCheckpoint();
    }
    pauseGamePlay()
    {
        const timer = this.timer;
        timer.events.unbind(timer.EVENT_SIMULATE, this.simulateListener);

        this.input = this.inputs.menu;
        timer.isSimulating = false;
    }
    resumeGamePlay()
    {
        const timer = this.timer;
        timer.events.bind(timer.EVENT_SIMULATE, this.simulateListener);

        this.input = this.inputs.character;
        timer.isSimulating = true;
    }
    resetCheckpoint()
    {
        this.resetObjects();
        this.world.updateTime(0);
        return this.readyBlink()
            .then(() => {
                this.resumeGamePlay();
            });
    }
    resetObjects()
    {
        this.world.objects.forEach(obj => {
            if (obj) {
                obj.traits.forEach(trait => {
                    if (typeof trait.reset === 'function') {
                        trait.reset();
                    }
                });
            }
        });
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
