(function() {
    var megaman2 = Game.Loader.XML.createFromXML('./game/resource/Megaman2.xml');
    window.megaman2 = megaman2;

    megaman2.promise.then(function() {
        var game = megaman2.game;
        var loader = megaman2.loader;
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
        document.addEventListener('click', function(e) {
            var el = e.target;
            if (el.matches('.weapons button')) {
                game.player.equipWeapon(el.getAttribute('weapon'));
            } else if (el.matches('.spawn button')) {
                game.scene.spawnCharacter(el.getAttribute('spawn'));
            }
        });

        gameElement = document.getElementById('game');

        function onFullscreenChange() {
            if(document.mozFullScreen || document.webkitIsFullScreen) {
                gameElement.classList.add('fullscreen');
            } else {
                gameElement.classList.remove('fullscreen');
            }

            megaman2.game.adjustAspectRatio();
        }

        window.addEventListener('resize', onFullscreenChange);
        document.addEventListener('mozfullscreenchange', onFullscreenChange);
        document.addEventListener('webkitfullscreenchange', onFullscreenChange);

        document.addEventListener('click', function(e) {
            if (e.target.matches('button.fullscreen')) {
                gameElement.webkitRequestFullScreen();
            }
        });
    });

    /*$('#nes-controller a')
        var isTouchDevice = false;
        .on('touchstart', keyBoardEvent)
        .on('touchend', keyBoardEvent)
        .on('mousedown', keyBoardEvent)
        .on('mouseup', keyBoardEvent);

    var keyBoardEvent = function(event) {
        event.stopPropagation();
        if (isTouchDevice && ["mousedown", "mouseup"].indexOf(event.type) > -1) {
            return;
        } else if (!isTouchDevice && ["touchstart", "touchend"].indexOf(event.type) > -1) {
            isTouchDevice = true;
        }

        var map = {
            "touchstart": "keydown",
            "touchend": "keyup",
            "mousedown": "keydown",
            "mouseup": "keyup",
        };

        var key = this.getAttribute('data-key');
        game.scene.input.trigger(key, map[event.type]);
    }*/
})();
