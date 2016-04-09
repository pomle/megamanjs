(function() {
    var megaman2 = Game.Loader.XML.createFromXML('./game/resource/Megaman2.xml');
    window.megaman2 = megaman2;

    megaman2.promise.then(function() {
        var game = megaman2.game;
        var loader = megaman2.loader;
        game.attachToElement(document.getElementById('screen'));
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
    });

    var isTouchDevice = false;

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
    }

    $('#nes-controller a')
        .on('touchstart', keyBoardEvent)
        .on('touchend', keyBoardEvent)
        .on('mousedown', keyBoardEvent)
        .on('mouseup', keyBoardEvent);


    function onFullscreenChange() {
        if(document.mozFullScreen || document.webkitIsFullScreen) {
            gameElement.classList.add('fullscreen');
        } else {
            gameElement.classList.remove('fullscreen');
        }

        game.adjustAspectRatio();
        //game.adjustResolution();
    }

    window.addEventListener('resize', onFullscreenChange);
    document.addEventListener('mozfullscreenchange', onFullscreenChange);
    document.addEventListener('webkitfullscreenchange', onFullscreenChange);

    $('button.fullscreen').on('click', function() {
        gameElement.webkitRequestFullScreen();
    });
    $('.weapons button').on('click', function() {
        game.player.equipWeapon($(this).attr('weapon'));
    });
    $('.spawn button').on('click', function() {
        game.scene.spawnCharacter($(this).attr('spawn'));
    });*/
})();
