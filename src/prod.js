(function() {
    var megaman2 = Game.Loader.XML.createFromXML('./resource/Megaman2.xml');
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

        var gameElement = document.getElementById('game');

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
})();
