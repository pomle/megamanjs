'use strict';

(function() {
    const megaman2 = Game.Loader.XML.createFromXML('./game/resource/Megaman2.xml');
    window.megaman2 = megaman2;

    megaman2.promise.then(function() {
        const game = megaman2.game;
        const loader = megaman2.loader;
        game.attachToElement(document.getElementById('screen'));

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

        loader.startScene(loader.entrypoint);

        window.addEventListener('focus', function() {
            if (!game.engine.isRunning) {
                game.engine.run();
            }
        });
        window.addEventListener('blur', function() {
            if (game.engine.isRunning) {
                game.engine.pause();
            }
        });

        const gameElement = document.getElementById('game');

        const actions = {
            'resetPlayer': (e) => {
                if (game.scene.resetPlayer) {
                    game.scene.resetPlayer();
                }
            },
            'toggleFullscreen': (e) => {
                gameElement.webkitRequestFullScreen();
            },
            'spawn': (e) => {
                const Obj = loader.resource.get('character', e.target.dataset.object);
                const obj = new Obj();
                const player = game.player.character;
                obj.moveTo({
                    x: player.position.x + 32,
                    y: player.position.y + 32,
                });
                game.scene.world.addObject(obj);
            },
            'weapon': (e) => {
                game.player.equipWeapon(e.target.dataset.weapon);
            }
        }

        document.addEventListener('click', function(e) {
            const name = e.target.name;
            for (const action in actions) {
                if (name === action) {
                    actions[action](e);
                    return;
                }
            }
        });

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
    });

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
