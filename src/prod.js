(function() {
    Game.Loader.XML.createFromXML('./resource/Megaman2.xml').then(loader => {
        const game = loader.game;
        game.attachToElement(document.getElementById('screen'));
        loader.startScene(loader.entrypoint);

        window.addEventListener('focus', function() {
            game.resume();
        });
        window.addEventListener('blur', function() {
            game.pause();
        });

        var gameElement = document.getElementById('game');

        function onFullscreenChange() {
            if(document.mozFullScreen || document.webkitIsFullScreen) {
                gameElement.classList.add('fullscreen');
            } else {
                gameElement.classList.remove('fullscreen');
            }

            loader.game.adjustAspectRatio();
        }

        window.addEventListener('resize', onFullscreenChange);
        document.addEventListener('mozfullscreenchange', onFullscreenChange);
        document.addEventListener('webkitfullscreenchange', onFullscreenChange);

        document.addEventListener('click', function(e) {
            if (e.target.matches('button.fullscreen')) {
                gameElement.webkitRequestFullScreen();
            }
        });

        window.megaman2 = loader;
    });
})();
