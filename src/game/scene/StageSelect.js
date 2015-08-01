Game.scenes.StageSelect = function()
{
    Game.Scene.apply(this, arguments);

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

    var input = new Engine.Keyboard();

    input.hit(input.LEFT,
        function() {
            this.steer(-1, 0);
        }.bind(this));

    input.hit(input.RIGHT,
        function() {
            this.steer(1, 0);
        }.bind(this));

    input.hit(input.UP,
        function() {
            this.steer(0, -1);
        }.bind(this));

    input.hit(input.DOWN,
        function() {
            this.steer(0, 1);
        }.bind(this));

    input.hit(input.START,
        function() {
            this.enter();
        }.bind(this));

    this.input = input;

    this.bind(this.EVENT_START, function() { this.input.enable(); });
    this.bind(this.EVENT_END, function() { this.input.disable(); });

    /* Hijack worlds time-legacy hack needs to go. */
    this.world.updateTime = this.updateTime.bind(this);
}

Engine.Util.extend(Game.scenes.StageSelect, Game.Scene);

Game.scenes.StageSelect.prototype.EVENT_STAGE_SELECTED = 'stage-selected';

Game.scenes.StageSelect.prototype.addStage = function(avatar, caption, name)
{
    var x = this.stages.length % this.rowLength;
    var y = Math.floor(this.stages.length / this.rowLength);

    var pos = new THREE.Vector2(this.spacing.x * x, this.spacing.y * y);
    var frame = this.frame.clone();

    caption = caption.split(" ");
    caption[1] = Engine.Util.string.fill(" ", 6 - caption[1].length) + caption[1];
    caption = caption.join("\n");

    var caption = Engine.SpriteManager.createTextSprite(caption);

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

Game.scenes.StageSelect.prototype.equalize = function(index)
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
    this.world.camera.camera.position.copy(center);
    this.world.camera.camera.position.z = this.cameraDesiredPosition.z - 100;


    this.selectIndex(index);
    this.background.position.copy(center);
    this.background.position.z -= 10;
}

Game.scenes.StageSelect.prototype.enter = function()
{
    this.trigger(this.EVENT_STAGE_SELECTED, this.stages[this.currentIndex], this.currentIndex);
}

Game.scenes.StageSelect.prototype.selectIndex = function(index)
{
    if (!this.stages[index]) {
        return false;
    }
    var avatar = this.stages[index].avatar;
    this.indicator.position.x = avatar.position.x;
    this.indicator.position.y = avatar.position.y;
    this.indicator.visible = true;
    this.indicatorStateTimer = 0;
    //this.cameraDesiredPosition.copy(this.indicator.position);
    //this.cameraDesiredPosition.z = 140;
    this.currentIndex = index;
    return this.currentIndex;
}

Game.scenes.StageSelect.prototype.setBackgroundColor = function(hexcolor)
{
    this.background.material.color.setHex(hexcolor);
}

Game.scenes.StageSelect.prototype.setFrame = function(model)
{
    this.frame = model;
}

Game.scenes.StageSelect.prototype.setIndicator = function(model)
{
    this.indicator = model;
    this.indicator.position.z = .1;
    this.world.scene.add(model);
}

Game.scenes.StageSelect.prototype.steer = function(x, y)
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

Game.scenes.StageSelect.prototype.updateTime = function(dt)
{
    this.indicatorStateTimer += dt;
    if (this.indicatorStateTimer >= this.indicatorInterval) {
        this.indicator.visible = !this.indicator.visible;
        this.indicatorStateTimer = 0;
    }

    if (this.world.camera.camera.position.distanceToSquared(this.cameraDesiredPosition) > 1) {
        var intermediate = this.cameraDesiredPosition.clone().sub(this.world.camera.camera.position).divideScalar(this.cameraSmoothing);
        this.world.camera.camera.position.add(intermediate);
    }

    Engine.Scene.prototype.updateTime.call(this.world, dt);
}
