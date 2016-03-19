$(function() {
    var game = Game.Loader.XML.createFromXML('./game/resource/Megaman2.xml', function() {
        console.log('Loading game done', game);
        game.attachToElement(document.getElementById('screen'));
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
        var name = map[event.type]
        var event = document.createEvent("Event");
        event.initEvent(name, true, true);
        event.keyCode = Engine.Keyboard.prototype[this.rel];
        window.dispatchEvent(event);
    }

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

    $('#nes-controller a')
        .on('touchstart', keyBoardEvent)
        .on('touchend', keyBoardEvent)
        .on('mousedown', keyBoardEvent)
        .on('mouseup', keyBoardEvent);

    var gameElement = document.getElementById('game');
    function on_fullscreen_change() {
        if(document.mozFullScreen || document.webkitIsFullScreen) {
            $(gameElement).addClass('fullscreen');
        }
        else {
            $(gameElement).removeClass('fullscreen');
        }

        game.adjustAspectRatio();
        //game.adjustResolution();
    }

    window.addEventListener('resize', on_fullscreen_change);
    document.addEventListener('mozfullscreenchange', on_fullscreen_change);
    document.addEventListener('webkitfullscreenchange', on_fullscreen_change);

    $('button.fullscreen').on('click', function() {
        gameElement.webkitRequestFullScreen();
    });
    $('.weapons button').on('click', function() {
        game.player.equipWeapon($(this).attr('weapon'));
    });
    $('.spawn button').on('click', function() {
        game.scene.spawnCharacter($(this).attr('spawn'));
    });

    window.game = game;
});
