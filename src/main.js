window.addEventListener('load', function() {
    const game = new Engine.Game;
    const loader = new Engine.Loader.XML(game);
    const env = {};

    const gameElement = document.getElementById('game');
    const screenElement = document.getElementById('screen');
    const controlElement = gameElement.querySelector('.control');

    function setupInputMapping() {
        const STORAGE_KEY = 'controller_mapping';
        const mapElement = controlElement.querySelector('.input-map');
        const messageElement = mapElement.querySelector('.message');
        const HUMAN_KEYS = {
            'a': 'A',
            'b': 'B',
            'start': 'START',
            'select': 'SELECT',
            'up': 'UP',
            'down': 'DOWN',
            'left': 'LEFT',
            'right': 'RIGHT',
        };
        const HUMAN_CODES = {
            37: '&larr;',
            38: '&uarr;',
            39: '&rarr;',
            40: '&darr;',
        };
        let keyName = null;

        function saveMap() {
            const map = game.input.exportMap();
            localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
        }

        function loadMap() {
            const map = localStorage.getItem(STORAGE_KEY);
            if (map) {
                game.input.importMap(JSON.parse(map));
            }
        }

        function handleInput(event) {
            const keyCode = event.keyCode;
            if (keyCode === 27) {
                stop();
                env.emitMessage(null);
                return;
            }

            game.input.assign(keyCode, keyName);
            const text = mapElement.dataset.msgRemapSuccess
                .replace('{{key}}', HUMAN_KEYS[keyName])
                .replace('{{code}}', HUMAN_CODES[keyCode] || String.fromCharCode(keyCode) || keyCode);
            env.emitMessage(text, false);
            saveMap();
            stop();
        }

        function start() {
            const text = mapElement.dataset.msgRemapQuery
                .replace('{{key}}', HUMAN_KEYS[keyName]);
            env.emitMessage(text, true);
            window.focus();
            window.addEventListener('keydown', handleInput);
        }

        function stop() {
            window.removeEventListener('keydown', handleInput);
        }

        function handleClick(event) {
            keyName = event.target.id;
            if (!keyName) {
                return;
            }
            stop();
            start();
        }

        const controller = mapElement.querySelector('#nes-controller');
        if (controller.contentDocument) {
            controller.contentDocument.addEventListener('click', handleClick);
        } else {
            controller.addEventListener('load', function(e) {
                this.contentDocument.addEventListener('click', handleClick);
            });
        }

        loadMap();
    }

    function setupMessaging() {
        const messageElement = gameElement.querySelector('.message');
        let timer;

        function emitMessage(text, hold = false)
        {
            if (!text) {
                messageElement.classList.remove('show');
                return;
            }
            messageElement.innerHTML = text;
            messageElement.classList.add('show');
            clearTimeout(timer);
            if (hold) {
                return;
            }
            timer = setTimeout(function() {
                messageElement.classList.remove('show');
            }, 3000);
        }

        env.emitMessage = emitMessage;
    }

    function setupInterruptDetection() {
        const sluggishPause = Engine.Mouse.sluggish(pause, 20);

        function pause() {
            if (document.body.classList.contains('dev-tools')) {
                return;
            }
            gameElement.removeEventListener('mousemove', sluggishPause);
            controlElement.classList.add('show');
            game.pause();
        }

        function resume() {
            controlElement.classList.remove('show');
            game.resume();
            setTimeout(function() {
                gameElement.removeEventListener('mousemove', sluggishPause);
                gameElement.addEventListener('mousemove', sluggishPause);
            }, 1000);
        }

        window.addEventListener('blur', pause);

        env.resume = resume;
        env.pause = pause;

        pause();
    }

    function updateScreen() {
        const maxRes = {
            x: 1280,
            y: 720,
        };
        const aspect = 16/9;
        const bounds = gameElement.getBoundingClientRect();
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

        game.adjustAspectRatio();
        game.setResolution(Math.min(maxRes.x, size.w),
                           Math.min(maxRes.y, size.h));
    }

    function setupActions() {
        const actions = {
            'fullscreen': e => {
                env.toggleFullscreen();
            },
            'resume': e => {
                env.resume();
            },
        }

        function routeAction(e) {
            const name = e.target.name;
            if (actions[name]) {
                actions[name](e);
            }
        }

        document.addEventListener('click', routeAction);
        window.addEventListener('resize', updateScreen);
    }

    function setupProgressbar() {
        const progressElement = gameElement.querySelector('.progress-bar > .progress');
        const res = loader.resourceLoader;
        res.events.bind(res.EVENT_PROGRESS, frac => {
            progressElement.style.width = frac * 100 + '%';
            gameElement.classList.add('busy');
        });
        res.events.bind(res.EVENT_COMPLETE, frac => {
            gameElement.classList.remove('busy');
        });
    }

    function setupFullscreenToggle() {
        function toggleFullscreen() {
            if (gameElement.classList.contains('fullscreen')) {
                document.webkitExitFullscreen();
            } else {
                gameElement.webkitRequestFullScreen();
            }
        }

        function fullscreenHandler() {
            if(document.webkitIsFullScreen) {
                gameElement.classList.add('fullscreen');
            } else {
                gameElement.classList.remove('fullscreen');
            }
        }

        document.addEventListener('webkitfullscreenchange', fullscreenHandler);
        document.addEventListener('fullscreenchange', fullscreenHandler);

        env.toggleFullscreen = toggleFullscreen;
    }


    setupInputMapping();
    setupInterruptDetection();
    setupFullscreenToggle();
    setupActions();
    setupMessaging();
    setupProgressbar();

    loader.loadGame('./resource/Megaman2.xml').then(entrypoint => {
        game.attachToElement(screenElement);
        game.attachController(window);

        const hud = new Engine.Hud;
        hud.attach(game, screenElement.querySelector('.energy'));
        updateScreen();
        gameElement.classList.add('ready');

        return loader.loadSceneByName(entrypoint);
    }).then(scene => {
        game.setScene(scene);
    });

    window.megaman2 = {
        env,
        game,
        loader,
    };
});
