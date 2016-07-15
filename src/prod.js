(function() {
    const game = new Game;
    const loader = new Game.Loader.XML(game);

    const gameElement = document.getElementById('game');
    const screenElement = document.getElementById('screen');
    const controlElement = screenElement.querySelector('.control');

    const progress = gameElement.querySelector('.progress-bar > .progress');
    loader.resourceLoader.events.bind(loader.resourceLoader.EVENT_PROGRESS, frac => {
        progress.style.width = frac * 100 + '%';
        gameElement.classList.add('busy');
    });
    loader.resourceLoader.events.bind(loader.resourceLoader.EVENT_COMPLETE, frac => {
        gameElement.classList.remove('busy');
    });

    function pause() {
        controlElement.classList.add('show');
        game.pause();
    }

    function resume() {
        controlElement.classList.remove('show');
        game.resume();
    }

    const actions = {
        'fullscreen': e => {
            gameElement.webkitRequestFullScreen();
        },
        'resume': e => {
            resume();
        },
    }

    function routeAction(e) {
        const name = e.target.name;
        for (const action in actions) {
            if (name === action) {
                actions[action](e);
                return;
            }
        }
    }

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

    screenElement.addEventListener('mousemove', pause);
    document.addEventListener('click', routeAction);


    window.addEventListener('resize', updateScreen);

    loader.loadGame('./resource/Megaman2.xml').then(entrypoint => {
        game.attachToElement(screenElement);
        game.attachController(window);

        const hud = new Game.Hud;
        hud.attach(game, screenElement.querySelector('.energy'));
        updateScreen();
        gameElement.classList.add('ready');

        const inputMapElement = controlElement.querySelector('.input-map');

        inputMapElement.querySelector('#nes-controller').addEventListener('load', function(e) {
            this.contentDocument.addEventListener('click', (function() {
                let keyName = null;

                const messageElement = inputMapElement.querySelector('.message');

                let successTimeout;
                function handleInputRemap(event) {
                    const keyCode = event.keyCode;
                    game.input.assign(keyCode, keyName);
                    const res = messageElement.querySelector('#remap-success');
                    res.innerHTML = res.dataset.text
                        .replace('{{key}}', keyName)
                        .replace('{{code}}', keyCode);
                    messageElement.classList.add('success');
                    clearTimeout(successTimeout);
                    successTimeout = setTimeout(function() {
                        messageElement.classList.remove('success');
                    }, 2000);
                    cancel();
                }

                function start() {
                    const msg = messageElement.querySelector('#press-any-key');
                    msg.innerHTML = msg.dataset.text.replace('{{key}}', keyName);
                    messageElement.classList.add('listening');
                    messageElement.classList.remove('success');
                    game.input.disable();
                    window.focus();
                    window.addEventListener('keydown', handleInputRemap);
                }

                function cancel() {
                    messageElement.classList.remove('listening');
                    window.removeEventListener('keydown', handleInputRemap);
                    game.input.enable();
                }

                return function handleInputRemap(event) {
                    keyName = event.target.id;
                    if (!keyName) {
                        return;
                    }
                    cancel();
                    start();
                }
            })());
        });

        return loader.loadSceneByName(entrypoint);
    }).then(scene => {
        game.setScene(scene);
    });

    window.megaman2 = {
        game,
        loader,
    };

})();
