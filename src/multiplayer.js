function attachControls(controller, guy) {
    controller.on('data', ({key, state}) => {
        if (key === 'LEFT') {
            if (state) {
                guy.aim.x = -1;
            } else {
                if (guy.aim.x === -1) {
                    guy.aim.x = 0;
                }
            }
        }

        if (key === 'RIGHT') {
            if (state) {
            guy.aim.x = 1;
        } else {
                if (guy.aim.x === 1) {
                    guy.aim.x = 0;
                }
            }
        }

        if (key === 'UP') {
            if (state) {
            guy.aim.y = 1;
        } else {
                if (guy.aim.y === 1) {
                    guy.aim.y = 0;
                }
            }
        }
        if (key === 'DOWN') {
            if (state) {
            guy.aim.y = -1;
        } else {
                if (guy.aim.y === -1) {
                    guy.aim.y = 0;
                }
            }
        }

        if (key === 'A') {
            if (state) {
                guy.jump.engage();
            } else {
                guy.jump.cancel();
            }
        }

        if (key === 'B' && state) {
            guy.weapon.fire();
        }
    });
}

export function multiplayer(loader) {
    const players = new Set();

    function createGuy() {
        if (players.size === 0) {
            return loader.game.player.character;
        }

        const mainPlayer = loader.game.player;

        const Megaman = loader.resourceManager.get('entity', 'Megaman');
        const guy = new Megaman();
        for (const key in mainPlayer.weapons) {
            if (!mainPlayer.weapons[key].user) {
                guy.weapon.equip(mainPlayer.weapons[key]);
                break;
            }
        }

        const origin = mainPlayer.character.position.clone();
        guy.moveTo(origin);
        guy.position.y += 500;
        origin.y += 64;
        guy.teleport.to(origin);
        loader.game.scene.world.addObject(guy);
        return guy;
    }

    return function handleController(controller) {
        const guy = createGuy();

        attachControls(controller, guy);

        const player = {
            controller,
            guy,
        };

        players.add(player);

        controller.on('leave', () => {
            if (loader.game.player.character !== player.guy) {
                loader.game.scene.world.removeObject(player.guy);
            }

            players.delete(player);
        });
    };
}

