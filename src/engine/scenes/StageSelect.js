Engine.scenes.StageSelect = function()
{
    Engine.Scene.call(this);
    this.camera.camera.position.z = 120;
    this.cameraDesiredPosition = new THREE.Vector3();
    this.cameraSmoothing = 20;
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

    this.input = new Engine.Keyboard();

    this.input.hit(37,
        function() {
            this.steer(-1, 0);
        }.bind(this));

    this.input.hit(39,
        function() {
            this.steer(1, 0);
        }.bind(this));

    this.input.hit(38,
        function() {
            this.steer(0, -1);
        }.bind(this));

    this.input.hit(40,
        function() {
            this.steer(0, 1);
        }.bind(this));

    this.input.enable();
}

Engine.scenes.StageSelect.loadFromXml = function(url, callback)
{
    Engine.Util.asyncLoadXml(url, function(xml, baseUrl) {
        var sceneXml = xml.children('stage-select');
        var scene = new Engine.scenes.StageSelect();

        var spriteUrl = sceneXml.attr('url');
        var spriteW = parseFloat(sceneXml.attr('w'));
        var spriteH = parseFloat(sceneXml.attr('h'));

        var backgroundXml = sceneXml.children('background');
        scene.setBackgroundColor(backgroundXml.attr('color'));

        var indicatorXml = sceneXml.children('indicator');
        scene.setIndicator(Engine.SpriteManager.createSingleTile(
            spriteUrl,
            parseFloat(indicatorXml.attr('w')), parseFloat(indicatorXml.attr('h')),
            parseFloat(indicatorXml.attr('x')), parseFloat(indicatorXml.attr('y')),
            spriteW, spriteH));

        var frameXml = sceneXml.children('frame');
        scene.setFrame(Engine.SpriteManager.createSingleTile(
            spriteUrl,
            parseFloat(frameXml.attr('w')), parseFloat(frameXml.attr('h')),
            parseFloat(frameXml.attr('x')), parseFloat(frameXml.attr('y')),
            spriteW, spriteH));

        sceneXml.find('> stage').each(function() {
            var stageXml = $(this);
            var avatar = Engine.SpriteManager.createSingleTile(
                spriteUrl,
                parseFloat(stageXml.attr('w')), parseFloat(stageXml.attr('h')),
                parseFloat(stageXml.attr('x')), parseFloat(stageXml.attr('y')),
                spriteW, spriteH);
            var index = parseFloat(stageXml.attr('index'));
            var name = stageXml.attr('name');
            var src = stageXml.attr('src');
            scene.addStage(avatar, name, src);
        });

        scene.equalize();
        callback(scene);
    });
}

Engine.scenes.StageSelect.prototype = Object.create(Engine.Scene.prototype);
Engine.scenes.StageSelect.prototype.constructor = Engine.scenes.StageSelect;

Engine.scenes.StageSelect.prototype.addStage = function(avatar, name, src)
{
    var x = this.stages.length % this.rowLength;
    var y = Math.floor(this.stages.length / this.rowLength);

    var pos = new THREE.Vector2(this.spacing.x * x, this.spacing.y * y);
    var frame = this.frame.clone();
    this.stages.push({
        "avatar": avatar,
        "name": name,
        "src": src,
    });
    frame.position.set(pos.x, pos.y, 0);
    avatar.position.set(pos.x, pos.y, .1);
    this.scene.add(frame);
    this.scene.add(avatar);
}

Engine.scenes.StageSelect.prototype.equalize = function()
{
    var centerIndex = 4;
    var center = this.stages[centerIndex].avatar.position;
    this.camera.camera.position.copy(center);
    this.camera.camera.position.z = 100;
    this.cameraDesiredPosition.copy(center);
    this.cameraDesiredPosition.z = 140;

    this.selectIndex(centerIndex);
    this.background.position.copy(center);
    this.background.position.z -= 10;
}

Engine.scenes.StageSelect.prototype.setBackgroundColor = function(hexcolor)
{
    this.background.material.color.setHex(hexcolor);
}

Engine.scenes.StageSelect.prototype.setFrame = function(model)
{
    this.frame = model;
}

Engine.scenes.StageSelect.prototype.steer = function(x, y)
{
    var desiredIndex = this.currentIndex + x + y * this.rowLength;
    var len = this.stages.length;
    var newIndex = (desiredIndex % len + len) % len;
    this.selectIndex(newIndex);
}

Engine.scenes.StageSelect.prototype.selectIndex = function(index)
{
    var avatar = this.stages[index].avatar;
    this.indicator.position.x = avatar.position.x;
    this.indicator.position.y = avatar.position.y;
    //this.cameraDesiredPosition.copy(this.indicator.position);
    //this.cameraDesiredPosition.z = 140;
    this.currentIndex = index;
}

Engine.scenes.StageSelect.prototype.setIndicator = function(model)
{
    this.indicator = model;
    this.indicator.position.z = .1;
    this.scene.add(model);
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
