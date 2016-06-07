'use strict';

Game.scenes.StageSelect = class StageSelect extends Game.Scene
{
    constructor()
    {
        super();

        this.EVENT_STAGE_SELECTED = 'stage-selected';
        this.EVENT_SELECTION_CHANGED = 'selection-changed';

        this.world.camera.camera.position.z = 120;
        this.cameraDesiredPosition = new THREE.Vector3();
        this.cameraDistance = 140;
        this.cameraSmoothing = 20;
        this.captionOffset = new THREE.Vector3(0, -32, .2);
        this.currentIndex = undefined;
        this.stages = [];
        this.rowLength = 3;
        this.spacing = {
            x: 64,
            y: -64,
        };
        this.indicatorInterval = 1/8;
        this.indicatorStateTimer = 0;

        this.background = new THREE.Mesh(
            new THREE.PlaneBufferGeometry(500, 500),
            new THREE.MeshBasicMaterial({
                color: 'blue'
            }));
        this.world.scene.add(this.background);

        var input = this.input;
        var scene = this;

        input.hit(this.input.LEFT, function() {
            scene.steer(-1, 0);
        });
        input.hit(input.RIGHT, function() {
            scene.steer(1, 0);
        });
        input.hit(input.UP, function() {
            scene.steer(0, -1);
        });
        input.hit(input.DOWN, function() {
            scene.steer(0, 1);
        });
        input.hit(input.START, function() {
            scene.enter();
        });

        var onSimulate = function(dt) {
            scene.updateTime(dt);
        }

        this.events.bind(this.EVENT_CREATE, (game) => {
            this.timer.events.bind(this.timer.EVENT_SIMULATE, onSimulate);
        });
        this.events.bind(this.EVENT_START, (game) => {
            scene.equalize(4);
        });
        this.events.bind(this.EVENT_DESTROY, (game) => {
            this.timer.events.unbind(this.timer.EVENT_SIMULATE, onSimulate);
        });
    }
    addStage(avatar, caption, name)
    {
        var x = this.stages.length % this.rowLength;
        var y = Math.floor(this.stages.length / this.rowLength);

        var pos = new THREE.Vector2(this.spacing.x * x, this.spacing.y * y);
        var frame = this.frame.clone();

        this.stages.push({
            "avatar": avatar,
            "name": name,
            "caption": caption,
            "frame": frame,
        });

        frame.position.set(pos.x, pos.y, 0);
        avatar.position.set(pos.x, pos.y, .1);
        caption.position.copy(avatar.position);
        caption.position.add(this.captionOffset);
        this.world.scene.add(frame);
        this.world.scene.add(avatar);
        this.world.scene.add(caption);
    }
    equalize(index)
    {
        if (!this.stages[index]) {
            index = 0;
        }

        var center = new THREE.Vector3();
        center.x = this.stages[0].avatar.position.x
                 + this.stages[this.rowLength - 1].avatar.position.x;
        center.x /= 2;

        center.y = this.stages[0].avatar.position.y
                 + this.stages[this.stages.length - 1].avatar.position.y;
        center.y /= 2;
        center.y -= 8; // Adjust for caption.

        this.cameraDesiredPosition.copy(center);
        this.cameraDesiredPosition.z += this.cameraDistance;
        this.world.camera.position.copy(center);
        this.world.camera.position.z = this.cameraDesiredPosition.z - 100;

        this.selectIndex(index);
        this.background.position.copy(center);
        this.background.position.z -= 10;
    }
    enter()
    {
        this.events.trigger(this.EVENT_STAGE_SELECTED,
            [this.stages[this.currentIndex], this.currentIndex]);
    }
    selectIndex(index)
    {
        if (!this.stages[index]) {
            return false;
        }
        var avatar = this.stages[index].avatar;
        this.indicator.position.x = avatar.position.x;
        this.indicator.position.y = avatar.position.y;
        this.indicator.visible = true;
        this.indicatorStateTimer = 0;

        if (index !== this.currentIndex) {
            this.events.trigger(this.EVENT_SELECTION_CHANGED, [index]);
        }
        this.currentIndex = index;

        return this.currentIndex;
    }
    setBackgroundColor(hexcolor)
    {
        this.background.material.color.setHex(hexcolor);
    }
    setFrame(model)
    {
        this.frame = model;
    }
    setIndicator(model)
    {
        this.indicator = model;
        this.indicator.position.z = .1;
        this.world.scene.add(model);
    }
    steer(x, y)
    {
        var newIndex = this.currentIndex;
        var d = (this.currentIndex % this.rowLength) + x;
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
    }
    updateTime(dt)
    {
        this.indicatorStateTimer += dt;
        if (this.indicatorStateTimer >= this.indicatorInterval) {
            this.indicator.visible = !this.indicator.visible;
            this.indicatorStateTimer = 0;
        }

        if (this.world.camera.camera.position.distanceToSquared(this.cameraDesiredPosition) > 1) {
            var intermediate = this.cameraDesiredPosition.clone()
                .sub(this.world.camera.camera.position)
                .multiplyScalar(dt * 3);
            this.world.camera.camera.position.add(intermediate);
        }
    }
}
