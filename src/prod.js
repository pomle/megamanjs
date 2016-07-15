(function() {
    const game = new Game;
    const loader = new Game.Loader.XML(game);

    const gameElement = document.getElementById('game');
    const screenElement = document.getElementById('screen');

    game.attachToElement(screenElement);
    game.attachController(window);

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

    function updateScreen() {
        const maxRes = {
            x: 1280,
            y: 720,
        };
        const aspect = 16/9;
        const bounds = gameElement.getBoundingClientRect();
        console.log(bounds);
        const size = {
            w: bounds.height * aspect,
            h: bounds.width / aspect,
        };
        if (size.h > bounds.height) {
            size.h = bounds.height;
        } else {
            size.w = bounds.width;
        }
        screenElement.style.width = size.w + 'px';
        screenElement.style.height = size.h + 'px';
        screenElement.style.marginTop = (bounds.height - size.h) / 2 + 'px';

        game.adjustAspectRatio();
        game.setResolution(Math.min(maxRes.x, size.w),
                           Math.min(maxRes.y, size.h));
    }

    window.addEventListener('resize', updateScreen);

    loader.loadGame('./resource/Megaman2.xml').then(entrypoint => {
        const hud = new Game.Hud;
        hud.attach(game, screenElement.querySelector('.energy'));
        updateScreen();
        gameElement.classList.add('ready');
        return loader.loadSceneByName(entrypoint);
    }).then(scene => {
        game.setScene(scene);
    });

    window.megaman2 = {
        game,
        loader,
    };

})();
