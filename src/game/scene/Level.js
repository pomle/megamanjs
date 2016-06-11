'use strict';

Game.scenes.Level = class Level extends Game.Scene
{
    constructor()
    {
        super();

        this.EVENT_PLAYER_RESET = 'player-reset';
        this.EVENT_PLAYER_DEATH = 'player-death';

        this.assets = {};
        this.player = null;
        this.camera.camera.position.z = 150;

        this.cameraFollowOffset = new THREE.Vector2(0, 25);
        this.checkPoints = [];
        this.checkPointIndex = 0;
        this.checkPointOffset = new THREE.Vector2(0, 200);

        this.deathRespawnTime = 4;

        const onDeath = () => {
            --this.player.lives;
            this.events.trigger(this.EVENT_PLAYER_DEATH);
            this.waitFor(this.deathRespawnTime).then(() => {
                if (this.player.lives <= 0) {
                    this.__end();
                } else {
                    this.resetPlayer();
                }
            });
        };

        this.events.bind(this.EVENT_CREATE, (game) => {
            this.inputs = {
                character: this.createCharacterInput(game),
                menu: this.createMenuInput(game),
            };
            this.player = game.player;

            const char = this.player.character;
            char.events.bind(char.EVENT_DEATH, onDeath);
        });
        this.events.bind(this.EVENT_DESTROY, () => {
            const char = this.player.character;
            char.events.unbind(char.EVENT_DEATH, onDeath);

            this.camera.unfollow();
            this.world.objects.forEach(object => {
                if (object !== undefined) {
                    this.world.removeObject(object);
                }
            });
        });

        this.timer.events.bind(this.timer.EVENT_UPDATE, () => {
            this.detectCheckpoint();
        });

        this.events.bind(this.EVENT_START, () => {
            this.resetPlayer()
        });
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
        var input = new Engine.Keyboard;
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
    followPlayer()
    {
        this.camera.follow(this.player.character,
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

        const model = this.assets['start-caption'];
        const camera = this.camera.camera;
        const interval = 9/60;

        model.visible = true;
        this.world.scene.add(model);

        return this.doFor(2, (elapsed) => {
            model.position.x = camera.position.x;
            model.position.y = camera.position.y;
            model.visible = elapsed % (interval * 2) < interval;
        }).then(() => {
            this.world.scene.remove(model);
        });
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
            var camera = this.camera;
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
            this.camera.follow(character);
            this.world.addObject(character);
        }

        this.events.trigger(this.EVENT_PLAYER_RESET);
    }
}
