import THREE from 'three';
import Easing from '../Easing';
import Entity from '../Object';
import Scene from '../Scene';

import Solid from '../traits/Solid';

class StageSelect extends Scene
{
    constructor()
    {
        super();

        this.EVENT_STAGE_ENTER = 'stage-enter';
        this.EVENT_STAGE_SELECTED = 'stage-selected';
        this.EVENT_SELECTION_CHANGED = 'selection-changed';
        this.EVENT_BOSS_REVEAL = 'boss-reveal';

        this._state = {};

        this.animations = {};
        this.camera.camera.position.z = 120;
        this.cameraDesiredPosition = new THREE.Vector3();
        this.cameraDistance = 140;
        this.cameraSmoothing = 20;
        this.captionOffset = new THREE.Vector3(0, -32, .2);
        this.currentIndex = undefined;
        this.initialIndex = 0;
        this.indicator = null;
        this.indicatorInterval = 1;
        this.podium = undefined;
        this.stages = [];
        this.stars = [];
        this.rowLength = 3;
        this.spacing = new THREE.Vector2(64, 64);
        this.starSpeed = 200;

        this.backgroundColor = new THREE.Mesh(
            new THREE.PlaneGeometry(500, 500),
            new THREE.MeshLambertMaterial());
        this.world.scene.add(this.backgroundColor);
        this.backgroundModel = undefined;

        const input = this.input;
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

        const simulate = (dt) => {
            this.update(dt);
        };

        this.modifiers = new Set();

        this.events.bind(this.EVENT_CREATE, (game) => {
            this.equalize(this.initialIndex);
            this.modifiers.clear();
            this.animations = {
                'flash': this.createFlashAnimation(),
                'indicator': this.createIndicatorAnimation(),
                'stars': this.createStarAnimation(),
            };
            /*if (game.state) {

            }*/
        });
        this.events.bind(this.EVENT_START, (game) => {
            this.world.events.bind(this.world.EVENT_SIMULATE, simulate);
            this.camera.panTo(this.cameraDesiredPosition, 1, Easing.easeOutQuad());
            this.enableIndicator();
            this.input.enable();
        });
        this.events.bind(this.EVENT_DESTROY, (game) => {
            this.world.events.unbind(this.world.EVENT_SIMULATE, simulate);
        });
    }
    addStage(avatar, caption, name, character)
    {
        const x = this.stages.length % this.rowLength;
        const y = Math.floor(this.stages.length / this.rowLength);

        const pos = new THREE.Vector2(this.spacing.x * x, -this.spacing.y * y);
        const frame = this.frame.clone();

        this.stages.push({
            "avatar": avatar,
            "name": name,
            "caption": caption,
            "frame": frame,
            "character": character,
        });

        frame.position.set(pos.x, pos.y, 0);
        avatar.position.set(pos.x, pos.y, .1);
        caption.position.copy(avatar.position);
        caption.position.add(this.captionOffset);
        this.world.scene.add(frame);
        this.world.scene.add(avatar);
        this.world.scene.add(caption);
    }
    addStar(model)
    {
        this.stars.push(model);
    }
    createFlashAnimation()
    {
        const backgroundColor = this.backgroundColor.material.ambient;
        const defaultBackgroundColor = backgroundColor.clone();
        const light = this.world.ambientLight.color;
        const defaultLight = light.clone();

        const interval = (3/60) * 2;
        let time = 0;
        let state = false;

        const on = () => {
            backgroundColor.setRGB(1,1,1);
            light.setRGB(5,5,5);
            state = true;
        };
        const off = () => {
            backgroundColor.copy(defaultBackgroundColor);
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
    createIndicatorAnimation()
    {
        const interval = this.indicatorInterval * 2;
        const indicator = this.indicator;
        let time = 0;
        return (dt) => {
            if (dt === -1) {
                time = 0;
                indicator.visible = false;
            } else {
                time += dt;
            }
            indicator.visible = (time % interval) / interval < .5;
        }
    }
    createStarAnimation()
    {
        const scene = this.world.scene;
        const spread = 160;
        const center = this.bossRevealCenter;
        const camera = this.camera.camera;
        const viewport = this.game.renderer.domElement;
        const aspect = viewport.width / viewport.height;

        this.stars.forEach(star => {
            const vFOV = camera.fov * Math.PI / 180;
            const h = 2 * Math.tan(vFOV / 2) * Math.abs(this.cameraDistance - star.position.z);
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
    equalize(index)
    {
        if (!this.stages[index]) {
            index = 0;
        }

        const center = new THREE.Vector3();
        center.x = this.stages[0].avatar.position.x
                 + this.stages[this.rowLength - 1].avatar.position.x;
        center.x /= 2;

        center.y = this.stages[0].avatar.position.y
                 + this.stages[this.stages.length - 1].avatar.position.y;
        center.y /= 2;
        center.y -= 8; // Adjust for caption.

        if (this.podium) {
            this.podium.position.copy(center);
            this.podium.position.y += 512;
            this.podiumSolid.position.copy(this.podium.position);
            this.podiumSolid.position.y -= 24;
        }

        this.stageSelectCenter = center.clone();
        this.stageSelectCenter.z += this.cameraDistance;
        this.bossRevealCenter = this.podium.position.clone();
        this.bossRevealCenter.z += this.cameraDistance;

        this.cameraDesiredPosition.copy(this.stageSelectCenter);
        this.camera.position.copy(center);
        this.camera.position.z = this.cameraDesiredPosition.z - 100;

        this.selectIndex(index);
        this.backgroundColor.position.copy(center);
        this.backgroundColor.position.z -= 10;
        this.backgroundModel.position.copy(center);
        this.backgroundColor.position.z -= 9;
        this.backgroundModel.position.copy(center);
    }
    enter()
    {
        this.input.release();
        this.input.disable();
        this.disableIndicator();

        const stage = this.getSelected();
        this.events.trigger(this.EVENT_STAGE_SELECTED, [stage]);
        this.runFlash().then(() => {
            if (stage.character) {
                return this.runBossReveal(stage).then(() => {
                    this.events.trigger(this.EVENT_STAGE_ENTER, [stage]);
                });
            } else {
                this.events.trigger(this.EVENT_STAGE_ENTER, [stage]);
            }
        });
    }
    getSelected()
    {
        return this.stages[this.currentIndex];
    }
    runFlash()
    {
        this.modifiers.add(this.animations.flash);
        return this.waitFor(1.0).then(() => {
            this.modifiers.delete(this.animations.flash);
            this.animations.flash(-1);
        });
    }
    runBossReveal(stage)
    {
        if (!this._state.bossReveal) {
            this._state.bossReveal = {};
        }
        const state = this._state.bossReveal;

        if (state.currentBoss) {
            this.world.removeObject(state.currentBoss);
        }

        const camera = this.camera;
        const character = new stage.character;
        character.direction.x = -1;
        character.position.copy(this.podium.position);
        character.position.y += 150;
        this.modifiers.add(this.animations.stars);
        this.events.trigger(this.EVENT_BOSS_REVEAL, [stage]);
        this.waitFor(.5).then(() => {
            state.currentBoss = character;
            this.world.addObject(character);
        });
        return camera.panTo(this.bossRevealCenter, 1, Easing.easeInOutCubic()).then(() => {
            return this.waitFor(6);
        });
    }
    selectIndex(index)
    {
        if (!this.stages[index]) {
            return false;
        }
        const avatar = this.stages[index].avatar;
        this.indicator.position.x = avatar.position.x;
        this.indicator.position.y = avatar.position.y;
        if (this.animations.indicator) {
            this.animations.indicator(-1);
        }

        this.currentIndex = index;

        return this.currentIndex;
    }
    setBackgroundModel(model)
    {
        if (this.backgroundModel) {
            this.world.scene.remove(this.backgroundModel);
        }
        this.backgroundModel = model;
        this.world.scene.add(model);
    }
    setBackgroundColor(hexcolor)
    {
        this.backgroundColor.material.ambient.setHex(hexcolor);
    }
    setFrame(model)
    {
        this.frame = model;
    }
    disableIndicator()
    {
        this.animations.indicator(-1);
        this.modifiers.delete(this.animations.indicator);
    }
    enableIndicator()
    {
        this.modifiers.add(this.animations.indicator);
    }
    setIndicator(model)
    {
        this.indicator = model;
        this.indicator.position.z = .1;
        this.world.scene.add(model);
    }
    setPodium(model)
    {
        this.podium = model;
        this.world.scene.add(model);
        const solid = new Entity();
        solid.addCollisionRect(64, 16);
        solid.applyTrait(new Solid());
        solid.solid.fixed = true;
        solid.solid.obstructs = true;
        this.podiumSolid = solid;
        this.world.addObject(solid);
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

        this.events.trigger(this.EVENT_SELECTION_CHANGED, [this.currentIndex]);
    }
    update(dt)
    {
        this.modifiers.forEach(mod => {
            mod(dt);
        });
    }
}

export default StageSelect;
