Megaman2.Level =
class Level extends Megaman2.Activity
{
    constructor(scene)
    {
        super(scene);
        this.scene.camera.position.z = 150;

        this.EVENT_PLAYER_RESET = 'player-reset';
        this.EVENT_PLAYER_DEATH = 'player-death';

        this.assets = {};
        this.player = null;

        this.cameraFollowOffset = new THREE.Vector2(0, 25);
        this.checkPoints = [];
        this.checkPointIndex = 0;
        this.checkPointOffset = new THREE.Vector2(0, 200);

        this.deathRespawnTime = 4;
        this.readyBlinkTime = 2;

        this.setupEvents();

        this.inputs = {
            character: this.createCharacterInput(),
            menu: this.createMenuInput(),
        };

        this.input = this.inputs.character;
    }
    setupEvents() {
        const scene = this.scene;

        const onUpdate = () => {
            this.detectCheckpoint();
        };

        scene.events.bind(scene.EVENT_CREATE, (game) => {
            const timer = game.timer;
            timer.events.bind(timer.EVENT_UPDATE, onUpdate);
            this.resetPlayer()
        });
        scene.events.bind(scene.EVENT_DESTROY, (game) => {
            const timer = game.timer;
            timer.events.unbind(timer.EVENT_UPDATE, onUpdate);
            this.scene.camera.unfollow();
        });
    }

    setPlayer(player) {
        const scene = this.scene;

        const onDeath = () => {
            --player.lives;
            this.events.trigger(this.EVENT_PLAYER_DEATH);
            this.waitFor(this.deathRespawnTime)
            .then(() => {
                if (player.lives <= 0) {
                    this.events.trigger(this.EVENT_END);
                } else {
                    this.resetPlayer();
                }
            });
        };

        const char = player.character;
        scene.events.bind(scene.EVENT_CREATE, () => {
            char.events.bind(char.health.EVENT_DEATH, onDeath);
        });
        scene.events.bind(scene.EVENT_DESTROY, () => {
            char.events.unbind(char.health.EVENT_DEATH, onDeath);
        });

        this.player = player;
    }

    addCheckPoint(x, y, r)
    {
        this.checkPoints.push({
            'pos': new THREE.Vector2(x, y),
            'radius': r || 100,
        });
    }

    createCharacterInput()
    {
        const input = new Engine.InputReceiver();

        input.listen(Engine.Input.NES.DPAD_STATE, (dir) => {
            this.player.character.aim.copy(dir);
        });

        input.listen(Engine.Input.NES.A, (state) => {
            console.log(state);
            if (state) {
                this.player.character.jump.engage();
            } else {
                this.player.character.jump.cancel();
            }
        });

        input.listen(Engine.Input.NES.B, (state) => {
            this.player.character.weapon.fire();
        });

        input.listen(Engine.Input.NES.SELECT, () => {
            this.events.trigger(this.EVENT_END);
        });

        return input;
    }

    createMenuInput()
    {
        return new Engine.InputReceiver();
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
        this.scene.camera.follow(this.player.character,
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
            return Engine.SyncPromise.resolve();
        }

        const model = this.assets['start-caption'];
        const camera = this.scene.camera.camera;
        const interval = 9/60;

        model.visible = true;
        this.scene.world.scene.add(model);

        return this.scene.doFor(this.readyBlinkTime, (elapsed) => {
            model.position.x = camera.position.x;
            model.position.y = camera.position.y;
            model.visible = elapsed % (interval * 2) < interval;
        }).then(() => {
            this.scene.world.scene.remove(model);
        });
    }

    pauseGamePlay()
    {
        this.input = this.inputs.menu;
        this.scene.pauseSimulation();
    }

    resumeGamePlay()
    {
        this.input = this.inputs.character;
        this.scene.resumeSimulation();
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
        this.scene.world.objects.forEach(obj => {
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

        this.scene.world.removeObject(character);

        character.reset();
        character.direction.set(character.DIRECTION_RIGHT, 0);
        character.integrator.reset();

        const checkpoint = this.checkPoints[this.checkPointIndex];
        if (checkpoint) {
            const startPosition = checkpoint.pos.clone();
            const playerPosition = checkpoint.pos.clone().add(this.checkPointOffset);
            const cameraPosition = checkpoint.pos.clone().add(this.cameraFollowOffset);

            const camera = this.scene.camera;
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
                this.scene.world.addObject(character);
            });
        }
        else {
            character.moveTo(new THREE.Vector2(0, 0));
            this.scene.camera.follow(character);
            this.scene.world.addObject(character);
            this.resumeGamePlay();
        }

        this.events.trigger(this.EVENT_PLAYER_RESET);
    }
}
