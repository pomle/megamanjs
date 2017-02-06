window.addEventListener('load', function() {
    const game = megaman2.game;

    window.addEventListener('keydown', (function() {
        const interval = 200;
        let last = 0;
        return function listenForDevRequest(e) {
            if (e.keyCode !== 27) {
                return;
            }
            const now = Date.now();
            if (now - interval < last) {
                toggleDev();
            }
            last = now;
        };
    })());

    let initialized = false;
    function initializeDev() {
        if (initialized) {
            return;
        }
        initialized = true;

        const devToolsTemplate = document.querySelector('#dev-tools');
        const devToolsElement = document.importNode(devToolsTemplate.content, true);
        document.body.appendChild(devToolsElement);

        setupInputRecorder();
    }

    function toggleDev() {
        initializeDev();
        document.body.classList.toggle('dev-tools');
    }

    const inputRecorder = {};
    function setupInputRecorder() {
        game.events.bind(game.EVENT_SCENE_CREATE, function(scene) {
            const input = (scene => {
                if (scene instanceof Engine.scenes.Level) {
                    return scene.inputs.character;
                } else {
                    return scene.input;
                }
            })(scene);
            inputRecorder.player = new Engine.InputPlayer(scene.world, input);
            inputRecorder.recorder = new Engine.InputRecorder(scene.world, input);
            inputRecorder.recorder.record();
        });

        game.events.bind(game.EVENT_SCENE_DESTROY, function(scene) {
            if (inputRecorder.recorder) {
                inputRecorder.recorder.stop();
                delete inputRecorder.recorder;
                delete inputRecorder.player;
            }
        });

        window.inputRecorder = inputRecorder;
    }


    const actions = {
        'adjustResolution': () => {
            game.adjustResolution();
        },
        'playInput': (e) => {
            const input = prompt('JSON');
            if (input) {
                inputRecorder.player.playJSON(input);
            }
        },
        'printInput': (e) => {
            console.log(inputRecorder.recorder.toJSON());
        },
        'recordInput': (e) => {
            inputRecorder.recorder.record();
        },
        'resetPlayer': (e) => {
            if (game.scene.resetPlayer) {
                game.scene.resetPlayer();
            }
        },
        'toggleFullscreen': (e) => {
            gameElement.webkitRequestFullScreen();
        },
        'setResolution': (e) => {
            if (e.type === 'change') {
                const res = e.target.value.split('x');
                game.setResolution(parseFloat(res[0]), parseFloat(res[1]));
            }
        },
        'spawn': (e) => {
            const Obj = loader.resourceManager.get('entity', e.target.dataset.object);
            const obj = new Obj();
            const pos = game.scene.camera.position;
            obj.moveTo({
                x: pos.x + 32,
                y: pos.y + 32,
            });
            game.scene.world.addObject(obj);
        },
        'speed': e => {
            game.setPlaybackSpeed(parseFloat(e.target.value));
        },
        'weapon': (e) => {
            game.player.equipWeapon(e.target.dataset.weapon);
        }
    }

    const actionRouter = function(e) {
        const action = e.target.name;
        if (actions[action]) {
            actions[action](e);
        }
    };

    document.addEventListener('click', actionRouter);
    document.addEventListener('change', actionRouter);

});

