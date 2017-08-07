const {Mouse} = require('@snakesilk/engine');
const {UI: {HUD}} = require('@snakesilk/megaman-kit');
const {createInput} = require('@snakesilk/nes-input-mapper');
const snex = require('snex');
const {createLoader} = require('./bootstrap');

function snexActivator(onSession, padType) {
    function node(tag, style) {
        const element = document.createElement(tag);
        Object.assign(element.style, style);
        return element;
    }

    const domElement = node('div', {
        position: 'relative',
        transform: 'rotateY(0deg)',
        transformStyle: 'preserve-3d',
        transition: 'transform 1s ease',
    });
    domElement.classList.add('snex-activator');

    const frontSide = node('div', {
        backfaceVisibility: 'hidden',
        cursor: 'pointer',
        position: 'absolute',
        height: '100%',
        transform: 'rotateY(0deg)',
        width: '100%',
    });
    domElement.appendChild(frontSide);

    const logoElement = node('img', {
        height: '100%',
        width: '100%',
    });
    logoElement.src = 'https://cdn.snex.io/images/snex-logo.svg';
    frontSide.appendChild(logoElement);

    const backSide = node('div', {
        alignItems: 'center',
        backfaceVisibility: 'hidden',
        display: 'flex',
        justifyContent: 'center',
        position: 'absolute',
        transform: 'rotateX(180deg)',
        height: '100%',
        width: '100%',
    });
    domElement.appendChild(backSide);

    const linkElement = node('div');
    backSide.appendChild(linkElement);

    const anchorElement = node('a', {
        color: '#fff',
    });
    anchorElement.target = '_blank';
    linkElement.appendChild(anchorElement);

    function activateHandler(event) {
        domElement.removeEventListener('click', activateHandler);
        domElement.style.transform = 'rotateX(0deg)';
        snex.createSession()
        .then(session => {
            onSession(session);
            return session.createURL(padType);
        })
        .then(({url}) => {
            anchorElement.textContent = url;
            anchorElement.href = url;
            domElement.style.transform = 'rotateX(180deg)';
        });
    }

    domElement.addEventListener('click', activateHandler);


    return domElement;
}

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

    const snexElement = snexActivator(session => {
        session.on('connection', conn => {
            conn.on('data', ({key, state}) => {
                game.input.trigger(key.toLowerCase(), state ? 'keydown' : 'keyup');
            });
        });
    }, 'nes');

    controlElement.querySelector('.snex').appendChild(snexElement);

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
