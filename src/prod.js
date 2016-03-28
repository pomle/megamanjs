var screen = document.getElementById('screen');

Game.Loader.XML.createFromXML('resource/Megaman2.xml').then(function(loader) {
    var game = loader.game;
    game.attachToElement(screen);

    var gameElement = document.getElementById('game');
    function onFullscreenChange() {
        if(document.mozFullScreen || document.webkitIsFullScreen) {
            gameElement.classList.add('fullscreen');
        }
        else {
            gameElement.classList.remove('fullscreen');
        }

        game.adjustAspectRatio();
    }

    function runGame() {
        if (!game.engine.isRunning) {
            game.engine.run();
        }
    }

    function pauseGame() {
        if (game.engine.isRunning) {
            game.engine.pause();
        }
    }

    window.addEventListener('resize', onFullscreenChange);
    window.addEventListener('focus', runGame);
    window.addEventListener('blur', pauseGame);

    document.addEventListener('mozfullscreenchange', onFullscreenChange);
    document.addEventListener('webkitfullscreenchange', onFullscreenChange);

    document.querySelector('button.fullscreen').addEventListener('click', function() {
        gameElement.webkitRequestFullScreen();
    });
});
