const THREE = require('three');
const Keyboard = require('../Keyboard');
const Scene = require('../Scene');
const SyncPromise = require('../SyncPromise');

class Level extends Scene
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
        this.readyBlinkTime = 2;

        const onDeath = () => {
            --this.player.lives;
            this.events.trigger(this.EVENT_PLAYER_DEATH);
            this.waitFor(this.deathRespawnTime).then(() => {
                if (this.player.lives <= 0) {
                    this.events.trigger(this.EVENT_END);
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
            if (char) {
                char.events.bind(char.health.EVENT_DEATH, onDeath);
            }
        });
        this.events.bind(this.EVENT_DESTROY, () => {
            const char = this.player.character;
            if (char) {
                char.events.unbind(char.health.EVENT_DEATH, onDeath);
            }

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
        const input = new Keyboard();
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
                this.events.trigger(this.EVENT_END);
            });

        return input;
    }
    createMenuInput()
    {
        var input = new Keyboard;
        return input;
    }
    detectCheckpoint()
    {
        if (this.player.character) {
            const playerPosition = this.player.character.position;
            for (let i = 0, l = this.checkPoints.length; i !== l; ++i) {
                const checkpoint = this.checkPoints[i];
                if (checkpoint.pos.distanceTo(playerPosition) < checkpoint.radius) {
                    this.checkPointIndex = i;
                    return;
                }
            }
        }
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
        if (this.readyBlinkTime === 0 || !this.assets['start-caption']) {
            return SyncPromise.resolve();
        }

        const model = this.assets['start-caption'];
        const camera = this.camera.camera;
        const interval = 9/60;

        model.visible = true;
        this.world.scene.add(model);

        return this.doFor(this.readyBlinkTime, (elapsed) => {
            model.position.x = camera.position.x;
            model.position.y = camera.position.y;
            model.visible = elapsed % (interval * 2) < interval;
        }).then(() => {
            this.world.scene.remove(model);
        });
    }
    pauseGamePlay()
    {
        const world = this.world;
        world.events.unbind(world.EVENT_SIMULATE, this.simulateListener);

        this.input = this.inputs.menu;
        this.pauseSimulation();
    }
    resumeGamePlay()
    {
        const world = this.world;
        world.events.bind(world.EVENT_SIMULATE, this.simulateListener);

        this.input = this.inputs.character;
        this.resumeSimulation();
    }
    resetCheckpoint()
    {
        this.resetObjects();
        return this.readyBlink().then(() => {
            this.resumeGamePlay();
        });
    }
    resetObjects()
    {
        this.world.objects.forEach(obj => {
            if (obj) {
                obj.reset();
            }
        });
    }
    resetPlayer()
    {
        const player = this.player;
        const character = player.character;
        if (!character) {
            return;
        }

        if (player.defaultWeapon) {
            player.equipWeapon(player.defaultWeapon);
        }

        this.world.removeObject(character);

        character.reset();
        character.direction.set(character.DIRECTION_RIGHT, 0);
        character.integrator.reset();

        const checkpoint = this.checkPoints[this.checkPointIndex];
        if (checkpoint) {
            const startPosition = checkpoint.pos.clone();
            const playerPosition = checkpoint.pos.clone().add(this.checkPointOffset);
            const cameraPosition = checkpoint.pos.clone().add(this.cameraFollowOffset);

            const camera = this.camera;
            camera.velocity.set(0, 0, 0);
            camera.unfollow();
            camera.jumpToPath(cameraPosition);

            const startFollow = () => {
                camera.follow(character);
                character.events.unbind(character.teleport.EVENT_END, startFollow);
            };
            character.moveTo(playerPosition);
            character.teleport.to(startPosition);
            character.events.bind(character.teleport.EVENT_END, startFollow);

            this.resetCheckpoint().then(() => {
                this.world.addObject(character);
            });
        }
        else {
            character.moveTo(new THREE.Vector2(0, 0));
            this.camera.follow(character);
            this.world.addObject(character);
            this.resumeGamePlay();
        }

        this.events.trigger(this.EVENT_PLAYER_RESET);
    }
}

module.exports = Level;
