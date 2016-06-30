(function() {
    const game = new Game;
    const loader = new Game.Loader.XML(game);

    const gameElement = document.getElementById('game');
    const screenElement = document.getElementById('screen');

    game.attachController(window);
    game.attachToElement(screenElement);

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
    loader.loadGame('./resource/Megaman2.xml').then(entrypoint => {
        return loader.loadSceneByName(entrypoint);
    }).then(scene => {
        game.setScene(scene);
    });

    window.megaman2 = {
        game,
        loader,
    };
})();
