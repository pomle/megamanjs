const {Vector2, Vector3} = require('three');
const {Easing, Entity} = require('@snakesilk/engine');
const {Solid} = require('@snakesilk/platform-traits');

class StageSelect
{
    constructor(scene) {
        this.scene = scene;

        this.EVENT_STAGE_ENTER = 'stage-enter';
        this.EVENT_STAGE_SELECTED = 'stage-selected';
        this.EVENT_SELECTION_CHANGED = 'selection-changed';
        this.EVENT_BOSS_REVEAL = 'boss-reveal';

        this._state = {};

        this.animations = {};
        this.currentIndex = undefined;
        this.initialIndex = 0;
        this.indicator = null;
        this.indicatorInterval = 1;
        this.podium = undefined;
        this.stages = [];
        this.stars = [];
        this.rowLength = undefined;
        this.spacing = new Vector2(64, 64);
        this.starSpeed = 200;

        const input = this.scene.input;
        input.disable();
        input.hit(input.LEFT, () => {
            this.steer(-1, 0);
        });
        input.hit(input.RIGHT, () => {
            this.steer(1, 0);
        });
        input.hit(input.UP, () => {
            this.steer(0, -1);
        });
        input.hit(input.DOWN, () => {
            this.steer(0, 1);
        });
        input.hit(input.START, () => {
            this.enter();
        });

        this.update = this.update.bind(this);

        this.modifiers = new Set();

        this.scene.events.bind(this.scene.EVENT_CREATE, (game) => {
            this.selectIndex(this.initialIndex);
            this.modifiers.clear();
        });

        this.scene.events.bind(this.scene.EVENT_START, () => {
            this.scene.world.events.bind(this.scene.world.EVENT_SIMULATE, this.update);
            this.enableIndicator();
            this.scene.input.enable();
        });

        this.scene.events.bind(this.scene.EVENT_DESTROY, () => {
            this.scene.world.events.unbind(this.scene.world.EVENT_SIMULATE, this.update);
        });
    }

    addStage(stage) {
        const {avatar, frame, caption} = stage;
        this.scene.world.addObject(frame);
        this.scene.world.addObject(avatar);
        this.scene.world.addObject(caption);
        this.stages.push(stage);
    }

    addStar(model) {
        this.stars.push(model);
    }

    initialize() {
        this.rowLength = Math.ceil(Math.sqrt(this.stages.length));

        const positions = this.stages.map((stage, index) => {
            const x = index % this.rowLength;
            const y = Math.floor(index / this.rowLength);
            return new Vector2(this.spacing.x * x, -this.spacing.y * y);
        });

        const xs = positions.map(p => p.x);
        const ys = positions.map(p => p.y);

        const offset = new Vector3(
            -(Math.max(...xs) - Math.min(...xs)) / 2,
            (Math.max(...ys) - Math.min(...ys)) / 2,
            0);

        /* Increase Y pos to account for caption. */
        offset.y += 8;

        this.stages.forEach(({avatar, caption, frame}, index) => {
            const pos = positions[index];
            frame.position.set(pos.x, pos.y, 0).add(offset);
            avatar.position.copy(frame.position);
            caption.position.copy(frame.position);
            caption.position.y -= 32;
        });

        this.indicator = this.scene.world.getObject('indicator');
    }

    createFlashAnimation() {
        const light = this.scene.world.ambientLight.color;
        const defaultLight = light.clone();

        const interval = (3/60) * 2;
        let time = 0;
        let state = false;

        const on = () => {
            light.setRGB(5,5,5);
            state = true;
        };
        const off = () => {
            light.copy(defaultLight);
            state = false;
        };

        return (dt) => {
            if (dt === -1) {
                time = 0;
                off();
            } else {
                time += dt;
                const prog = (time % interval) / interval;
                if (state === true && prog < .5) {
                    off();
                } else if (state === false && prog > .5) {
                    on();
                }
            }
        }
    }

    createStarAnimation() {
        const scene = this.scene.world.scene;
        const spread = 160;
        const center = this.scene.world.getObject('podium').position.clone();
        const camera = this.scene.camera.camera;
        const aspect = 16/9;

        this.stars.forEach(star => {
            const vFOV = camera.fov * Math.PI / 180;
            const h = 2 * Math.tan(vFOV / 2) * Math.abs(this.scene.camera.position.z - star.position.z);
            const w = h * aspect;
            star.position.x = center.x + (Math.random() * w) - w / 2;
            star.position.y = center.y + (Math.random() * h) - h / 2;
            star.userData.maxY = center.y + h / 2;
            star.userData.minY = center.y - h / 2;
            star.userData.maxX = center.x + w / 2;
            star.userData.minX = center.x - w / 2;
            scene.add(star);
        });

        return dt => {
            this.stars.forEach(star => {
                if (star.position.x > star.userData.maxX) {
                    star.position.x = star.userData.minX;
                    star.position.y = star.userData.minY + Math.random() * Math.abs(star.userData.minY - star.userData.maxY);
                }
                star.position.x += this.starSpeed * dt;
            });
        }
    }

    enter() {
        this.scene.input.release();
        this.scene.input.disable();
        this.disableIndicator();

        const stage = this.getSelected();
        this.scene.events.trigger(this.EVENT_STAGE_SELECTED, [stage]);
        this.runFlash()
        .then(() => this.runBossReveal(stage))
        .then(() => {
            this.scene.events.trigger(
                this.EVENT_STAGE_ENTER,
                [stage]);
        });
    }

    getSelected() {
        return this.stages[this.currentIndex];
    }

    runFlash() {
        const flash = this.createFlashAnimation();
        this.modifiers.add(flash);
        return this.scene.waitFor(1.0).then(() => {
            this.modifiers.delete(flash);
        });
    }

    runBossReveal(stage) {
        if (!stage.character) {
            return Promise.resolve();
        }

        if (!this._state.bossReveal) {
            this._state.bossReveal = {};
        }
        const state = this._state.bossReveal;

        if (state.currentBoss) {
            this.scene.world.removeObject(state.currentBoss);
        }

        const podium = this.scene.world.getObject('podium');

        const scene = this.scene;
        const camera = scene.camera;
        const character = new stage.character();
        character.direction.x = -1;
        character.position.copy(podium.position);
        character.position.y += 150;

        scene.events.trigger(this.EVENT_BOSS_REVEAL, [stage]);
        state.currentBoss = character;
        scene.waitFor(.5).then(() => {

            scene.world.addObject(character);
        });

        const stars = this.createStarAnimation();
        this.modifiers.add(stars);

        return camera.panTo(
            new Vector2().copy(podium.position),
            1,
            Easing.easeInOutCubic()
        )
        .then(() => scene.waitFor(6))
        .then(() => this.modifiers.delete(stars))
    }

    selectIndex(index) {
        if (!this.stages[index]) {
            return false;
        }

        const pos = this.stages[index].avatar.position;

        this.indicator.position.x = pos.x;
        this.indicator.position.y = pos.y;

        this.indicator.blink.reset();

        this.currentIndex = index;

        return this.currentIndex;
    }

    disableIndicator() {
        this.scene.world.removeObject(this.indicator);
    }

    enableIndicator() {
        this.indicator.blink.reset();
        this.scene.world.addObject(this.indicator);
    }

    steer(x, y) {
        let newIndex = this.currentIndex;
        let d = (this.currentIndex % this.rowLength) + x;
        if (d >= 0 && d < this.rowLength) {
            newIndex += x;
        }
        d = newIndex + y * this.rowLength;
        if (d >= 0 && d < this.stages.length) {
            newIndex = d;
        }

        if (newIndex === this.currentIndex) {
            return;
        }

        this.selectIndex(newIndex);

        this.scene.events.trigger(this.EVENT_SELECTION_CHANGED, [this.currentIndex]);
    }

    update(dt) {
        this.modifiers.forEach(mod => {
            mod(dt);
        });
    }
}

module.exports = StageSelect;
