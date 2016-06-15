'use strict';

(function() {
    const game = new Game;
    const loader = new Game.Loader.XML(game);

    const gameElement = document.getElementById('game');
    const screenElement = document.getElementById('screen');

    game.attachToElement(screenElement);

    game.events.bind(game.EVENT_SCENE_CREATE, function(scene) {
        if (scene instanceof Game.scenes.Level) {
            window.inputRecorder = new Engine.InputRecorder(game, scene.inputs.character);
            window.inputRecorder.listen();
            window.inputRecorder.record();
        }
    });

    game.events.bind(game.EVENT_SCENE_DESTROY, function(scene) {
        if (window.inputRecorder) {
            window.inputRecorder.stop();
            window.inputRecorder.unlisten();
            delete window.inputRecorder;
        }
    });

    const progress = gameElement.querySelector('.progress-bar > .progress');
    loader.resourceLoader.events.bind(loader.resourceLoader.EVENT_PROGRESS, frac => {
        progress.style.width = frac * 100 + '%';
        gameElement.classList.add('busy');
    });
    loader.resourceLoader.events.bind(loader.resourceLoader.EVENT_COMPLETE, frac => {
        gameElement.classList.remove('busy');
    });

    window.addEventListener('focus', function() {
        game.resume();
    });
    window.addEventListener('blur', function() {
        game.pause();
    });

    const actions = {
        'adjustResolution': () => {
            game.adjustResolution();
        },
        'resetPlayer': (e) => {
            if (game.scene.resetPlayer) {
                game.scene.resetPlayer();
            }
        },
        'toggleFullscreen': (e) => {
            gameElement.webkitRequestFullScreen();
        },
        'setResolution': (e) => {
            if (e.type === 'change') {
                const res = e.target.value.split('x');
                game.setResolution(parseFloat(res[0]), parseFloat(res[1]));
            }
        },
        'spawn': (e) => {
            const Obj = loader.resourceManager.get('character', e.target.dataset.object);
            const obj = new Obj();
            const player = game.player.character;
            obj.moveTo({
                x: player.position.x + 32,
                y: player.position.y + 32,
            });
            game.scene.world.addObject(obj);
        },
        'speed': e => {
            game.setPlaybackSpeed(parseFloat(e.target.value));
        },
        'weapon': (e) => {
            game.player.equipWeapon(e.target.dataset.weapon);
        }
    }

    const actionRouter = function(e) {
        const name = e.target.name;
        for (const action in actions) {
            if (name === action) {
                actions[action](e);
                return;
            }
        }
    };

    document.addEventListener('click', actionRouter);
    document.addEventListener('change', actionRouter);

    function onFullscreenChange() {
        if(document.mozFullScreen || document.webkitIsFullScreen) {
            gameElement.classList.add('fullscreen');
        } else {
            gameElement.classList.remove('fullscreen');
        }
        game.adjustAspectRatio();
    }

    window.addEventListener('resize', onFullscreenChange);
    document.addEventListener('mozfullscreenchange', onFullscreenChange);
    document.addEventListener('webkitfullscreenchange', onFullscreenChange);

    loader.loadGame('./resource/Megaman2.xml').then(entrypoint => {
        const hud = new Game.Hud;
        hud.attach(game, screenElement.querySelector('.energy'));
        return loader.loadSceneByName(entrypoint);
    }).then(scene => {
        game.setScene(scene);
    });

    window.megaman2 = {
        game,
        loader,
    };

    /*$('#nes-controller a')
        const isTouchDevice = false;
        .on('touchstart', keyBoardEvent)
        .on('touchend', keyBoardEvent)
        .on('mousedown', keyBoardEvent)
        .on('mouseup', keyBoardEvent);

    const keyBoardEvent = function(event) {
        event.stopPropagation();
        if (isTouchDevice && ["mousedown", "mouseup"].indexOf(event.type) > -1) {
            return;
        } else if (!isTouchDevice && ["touchstart", "touchend"].indexOf(event.type) > -1) {
            isTouchDevice = true;
        }

        const map = {
            "touchstart": "keydown",
            "touchend": "keyup",
            "mousedown": "keydown",
            "mouseup": "keyup",
        };

        const key = this.getAttribute('data-key');
        game.scene.input.trigger(key, map[event.type]);
    }*/
})();
