'use strict';

Megaman2.StageSelect =
class StageSelect extends Megaman2.Activity
{
    constructor(scene)
    {
        super(scene);
        this.scene.camera.camera.position.z = 120;

        this.input = this.setupInput();

        this.RESET = Symbol();

        this.EVENT_STAGE_ENTER = 'stage-enter';
        this.EVENT_STAGE_SELECTED = 'stage-selected';
        this.EVENT_SELECTION_CHANGED = 'selection-changed';
        this.EVENT_BOSS_REVEAL = 'boss-reveal';

        this.cameraDesiredPosition = new THREE.Vector3();
        this.cameraDistance = 140;
        this.cameraSmoothing = 20;

        this.captionOffset = new THREE.Vector3(0, -32, .2);
        this.currentBoss = null;

        this.currentIndex = null;
        this.initialIndex = 0;

        this.indicator = this.scene.world.getObject('indicator');
        this.indicator.position.z = .1;
        this.indicatorInterval = 1;

        this.rowLength = 3;
        this.stages = [];
        this.stars = [];
        this.spacing = new THREE.Vector2(64, 64);
        this.starSpeed = 200;

        this.bossRevealEasing = Engine.Easing.easeInOutCubic();
        this.zoomInEasing = Engine.Easing.easeOutQuad();

        this.modifiers = new Set();

        this.animations = {
            'flash': this.createFlashAnimation(),
            'indicator': this.createIndicatorAnimation(),
            'stars': this.createStarAnimation(),
        };

        this.setupInput();
        this.setupSceneEvents(scene);
    }
    setupInput() {
        const input = new Engine.InputReceiver();
        input.disable();

        input.listen(Engine.Input.NES.DPAD_TAP, dir => {
            this.steer(dir.x, -dir.y);
        });

        input.listen(Engine.Input.NES.START, () => {
            this.enter();
        });

        return input;
    }
    setupSceneEvents(scene) {
        const events = scene.events;
        const world = scene.world;

        world.events.bind(world.EVENT_UPDATE, (dt) => {
            this.modifiers.forEach(mod => mod(dt));
        });

        events.bind(scene.EVENT_CREATE, (game) => {
            this.equalize(game);
            this.modifiers.clear();
            this.modifiers.add(this.animations.indicator);
            this.input.enable();

            scene.camera.panTo(this.cameraDesiredPosition, 1, this.zoomInEasing);
            this.selectIndex(this.initialIndex);
            this.enableIndicator();
        });
    }
    addStage(avatar, caption, name, character)
    {
        const x = this.stages.length % this.rowLength;
        const y = Math.floor(this.stages.length / this.rowLength);

        const pos = new THREE.Vector2(this.spacing.x * x, -this.spacing.y * y);
        const frame = this.frame.clone();

        this.stages.push({
            avatar,
            name,
            caption,
            frame,
            character,
        });

        frame.position.set(pos.x, pos.y, 0);
        avatar.position.set(pos.x, pos.y, .1);
        caption.position.copy(avatar.position);
        caption.position.add(this.captionOffset);

        const scene = this.scene.world.scene;
        scene.add(frame);
        scene.add(avatar);
        scene.add(caption);
    }
    addStar(model)
    {
        this.stars.push(model);
    }
    createFlashAnimation()
    {
        const lightColor = this.scene.world.ambientLight.color;
        const defaultLightColor = lightColor.clone();

        const interval = (3 / 60) * 2;
        let time = 0;
        let state = false;

        const on = () => {
            lightColor.setRGB(5,5,5);
            state = true;
        };
        const off = () => {
            lightColor.copy(defaultLightColor);
            state = false;
        };

        return (dt) => {
            if (dt === this.RESET) {
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
    createIndicatorAnimation()
    {
        const model = this.indicator.model;
        let time = 0;
        return (dt) => {
            const interval = this.indicatorInterval * 2;
            if (dt === this.RESET) {
                time = 0;
                model.visible = true;
            } else {
                time = time + dt;
                model.visible = (time % interval) / interval < .5;
            }
        };
    }
    createStarAnimation()
    {
        return (dt) => {
            this.stars.forEach(star => {
                if (star.position.x > star.userData.maxX) {
                    star.position.x = star.userData.minX;
                    star.position.y = star.userData.minY + Math.random() * Math.abs(star.userData.minY - star.userData.maxY);
                }
                star.position.x += this.starSpeed * dt;
            });
        }
    }
    equalize(game) {
        const scene = this.scene;
        const world = scene.world;
        const camera = scene.camera;

        const center = new THREE.Vector3();
        center.x = this.stages[0].avatar.position.x
                 + this.stages[this.rowLength - 1].avatar.position.x;
        center.x /= 2;

        center.y = this.stages[0].avatar.position.y
                 + this.stages[this.stages.length - 1].avatar.position.y;
        center.y /= 2;
        center.y -= 8; // Adjust for caption.

        const podium = world.getObject('podium');
        podium.position.copy(center);
        podium.position.y += 512;

        const background = world.getObject('background');
        background.position.copy(center);
        background.position.z -= 10;

        this.stageSelectCenter = center.clone();
        this.stageSelectCenter.z += this.cameraDistance;
        this.bossRevealCenter = podium.position.clone();
        this.bossRevealCenter.z += this.cameraDistance;

        this.cameraDesiredPosition.copy(this.stageSelectCenter);
        camera.position.copy(center);
        camera.position.z = this.cameraDesiredPosition.z - 100;

        center.copy(podium.position);
        const spread = 160;
        const viewport = game.renderer.domElement;
        const aspect = viewport.width / viewport.height;
        const vFOV = camera.camera.fov * Math.PI / 180;

        this.stars.forEach(star => {
            const h = 2 * Math.tan(vFOV / 2) * Math.abs(this.cameraDistance - star.position.z);
            const w = h * aspect;
            star.position.x = center.x + (Math.random() * w) - w / 2;
            star.position.y = center.y + (Math.random() * h) - h / 2;
            star.userData.maxY = center.y + h / 2;
            star.userData.minY = center.y - h / 2;
            star.userData.maxX = center.x + w / 2;
            star.userData.minX = center.x - w / 2;
            star.position.z -= 1;
            world.scene.add(star);
        });
    }
    enter()
    {
        this.input.disable();
        this.disableIndicator();

        const stage = this.getSelected();
        this.scene.events.trigger(this.EVENT_STAGE_SELECTED);
        this.events.trigger(this.EVENT_STAGE_SELECTED, [stage]);

        this.runFlash()
        .then(() => stage.character && this.runBossReveal(stage))
        .then(() => this.events.trigger(this.EVENT_GOTO_SCENE, [stage.name]));
    }
    getSelected()
    {
        return this.stages[this.currentIndex];
    }
    runFlash()
    {
        this.modifiers.add(this.animations.flash);
        return this.scene.waitFor(1.0).then(() => {
            this.modifiers.delete(this.animations.flash);
            this.animations.flash(-1);
        });
    }
    runBossReveal(stage)
    {
        const scene = this.scene;
        const camera = scene.camera;

        if (this.currentBoss) {
            scene.world.removeObject(this.currentBoss);
            this.currentBoss = null;
        }

        const character = new stage.character();
        character.direction.x = -1;

        const podium = scene.world.getObject('podium');
        character.position.copy(podium.position);
        character.position.y += 150;

        this.modifiers.add(this.animations.stars);
        scene.events.trigger(this.EVENT_BOSS_REVEAL, [stage]);

        const bossTask = scene.waitFor(.5)
            .then(() => {
                this.currentBoss = character;
                scene.world.addObject(character);
            });

        const cameraTask = camera.panTo(this.bossRevealCenter, 1, this.bossRevealEasing)
            .then(() => scene.waitFor(6));

        return Promise.all([
            bossTask,
            cameraTask,
        ]);
    }
    selectIndex(index)
    {
        if (!this.stages[index]) {
            return false;
        }
        const avatar = this.stages[index].avatar;
        this.indicator.position.x = avatar.position.x;
        this.indicator.position.y = avatar.position.y;
        this.animations.indicator(this.RESET);

        this.currentIndex = index;

        return this.currentIndex;
    }
    setFrame(model)
    {
        this.frame = model;
    }
    disableIndicator()
    {
        this.animations.indicator(this.RESET);
        this.modifiers.delete(this.animations.indicator);
    }
    enableIndicator()
    {
        this.modifiers.add(this.animations.indicator);
    }
    steer(x, y)
    {
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
}