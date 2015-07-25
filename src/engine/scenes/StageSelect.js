Engine.scenes.StageSelect = function()
{
    Engine.Scene.call(this);
    this.camera.camera.position.z = 120;
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
    this.scene.add(this.background);

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

    input.enable();

    this.input = input;
}

Engine.scenes.StageSelect.prototype = Object.create(Engine.Scene.prototype);
Engine.scenes.StageSelect.prototype.constructor = Engine.scenes.StageSelect;

Engine.scenes.StageSelect.prototype.__destroy = function()
{
    this.input.disable();
}


Engine.scenes.StageSelect.prototype.addStage = function(avatar, name, scene)
{
    var x = this.stages.length % this.rowLength;
    var y = Math.floor(this.stages.length / this.rowLength);

    var pos = new THREE.Vector2(this.spacing.x * x, this.spacing.y * y);
    var frame = this.frame.clone();

    name = name.split(" ");
    name[1] = Engine.Util.string.fill(" ", 6 - name[1].length) + name[1];
    name = name.join("\n");

    var caption = Engine.SpriteManager.createTextSprite(name);

    this.stages.push({
        "avatar": avatar,
        "name": name,
        "scene": scene,
        "caption": caption,
        "frame": frame,
    });

    frame.position.set(pos.x, pos.y, 0);
    avatar.position.set(pos.x, pos.y, .1);
    caption.position.copy(avatar.position);
    caption.position.add(this.captionOffset);
    this.scene.add(frame);
    this.scene.add(avatar);
    this.scene.add(caption);
}

Engine.scenes.StageSelect.prototype.equalize = function(index)
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
    this.camera.camera.position.copy(center);
    this.camera.camera.position.z = this.cameraDesiredPosition.z - 100;


    this.selectIndex(index);
    this.background.position.copy(center);
    this.background.position.z -= 10;
}

Engine.scenes.StageSelect.prototype.enter = function()
{
    var stage = this.stages[this.currentIndex];
    this.exit(stage.scene);
}

Engine.scenes.StageSelect.prototype.selectIndex = function(index)
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

Engine.scenes.StageSelect.prototype.setBackgroundColor = function(hexcolor)
{
    this.background.material.color.setHex(hexcolor);
}

Engine.scenes.StageSelect.prototype.setFrame = function(model)
{
    this.frame = model;
}

Engine.scenes.StageSelect.prototype.setIndicator = function(model)
{
    this.indicator = model;
    this.indicator.position.z = .1;
    this.scene.add(model);
}

Engine.scenes.StageSelect.prototype.steer = function(x, y)
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

Engine.scenes.StageSelect.prototype.updateTime = function(dt)
{
    this.indicatorStateTimer += dt;
    if (this.indicatorStateTimer >= this.indicatorInterval) {
        this.indicator.visible = !this.indicator.visible;
        this.indicatorStateTimer = 0;
    }

    if (this.camera.camera.position.distanceToSquared(this.cameraDesiredPosition) > 1) {
        var intermediate = this.cameraDesiredPosition.clone().sub(this.camera.camera.position).divideScalar(this.cameraSmoothing);
        this.camera.camera.position.add(intermediate);
    }

    Engine.Scene.prototype.updateTime.call(this, dt);
}
