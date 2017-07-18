const {Mouse} = require('@snakesilk/engine');
const {UI: {HUD}} = require('@snakesilk/megaman-kit');
const {createInput} = require('@snakesilk/nes-input-mapper');
const {createLoader} = require('./bootstrap');

window.addEventListener('load', function() {
    const loader = createLoader();
    const game = loader.game;

    const env = {};

    const gameElement = document.getElementById('game');
    const screenElement = document.getElementById('screen');
    const controlElement = gameElement.querySelector('.control');

    function setupInterruptDetection() {
        const sluggishPause = Mouse.sluggish(pause, 20);

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

    const inputElement = controlElement.querySelector('.input-map');
    inputElement.appendChild(createInput(game, inputElement.querySelector('#nes-controller')));

    setupInterruptDetection();
    setupFullscreenToggle();
    setupActions();
    setupProgressbar();

    const hud = new HUD();
    hud.attach(game, screenElement.querySelector('.energy'));
    game.attachToElement(screenElement);
    game.attachController(window);
    updateScreen();

    loader.loadGame('./resource/Megaman2.xml');

    window.megaman2 = {
        env,
        game,
        loader,
    };
});
