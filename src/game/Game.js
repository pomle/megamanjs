var Game = function()
{
    this.engine = undefined;
    this.player = undefined;

    this.scenes = {};

    this.level = undefined;

    window.addEventListener('focus', function() {
        if (this.engine && !this.engine.isRunning) {
            this.engine.run();
        }
    }.bind(this));
    window.addEventListener('blur', function() {
        if (this.engine && this.engine.isRunning) {
            this.engine.pause();
        }
    }.bind(this));

    this.sceneQueue = [];
}

Game.traits = {};
Game.scenes = {};

Game.prototype.addScene = function(type, name, src)
{
    this.scenes[name] = {
        type: type,
        name: name,
        src: src,
    };
}

Game.prototype.queueScene = function(name)
{
    this.sceneQueue.push(name);
}

Game.prototype.attachToElement = function(element)
{
    this.element = element;
    var rect = this.element.getBoundingClientRect();
    this.engine.renderer.setSize(rect.width, rect.height);
    this.engine.renderer.domElement.removeAttribute("style");
    this.element.appendChild(this.engine.renderer.domElement);
}

Game.prototype.adjustAspectRatio = function()
{
    if (this.engine.scene) {
        var rect = this.element.getBoundingClientRect();
        var cam = this.engine.scene.camera.camera;
        cam.aspect = rect.width / rect.height;
        cam.updateProjectionMatrix();
    }
}

Game.prototype.adjustResolution = function()
{
    var rect = this.element.getBoundingClientRect();
    this.engine.renderer.setSize(rect.width, rect.height);
}

Game.prototype.createScene = function(type, xmlUrl)
{
    var scene;
    var callback = function() {
        this.setScene(scene);
    }.bind(this);

    switch (type) {
        case 'level':
            scene = Game.XMLUtil.createLevel(xmlUrl, callback);
            break;
        case 'stage-select':
            scene = Game.XMLUtil.createStageSelect(xmlUrl, callback);
            break;
    }
}

Game.prototype.loadScene = function(name)
{
    if (!this.scenes[name]) {
        throw new Error("Scene " + name + " not defined");
    }

    return this.createScene(this.scenes[name].type, this.scenes[name].src);
}

Game.prototype.setScene = function(scene)
{
    if (scene instanceof Engine.Scene === false) {
        throw new Error('Invalid scene');
    }
    this.engine.pause();

    if (this.engine.scene) {
        this.engine.scene.__destroy();
    }

    scene.exit = function(name) {
        this.loadScene(name);
    }.bind(this);

    var start;
    if (scene instanceof Engine.scenes.Level) {
        this.level = new Game.LevelRunner(this, scene);
        start = function() {
            this.level.startGamePlay();
        }.bind(this)
    }
    else {
        this.engine.scene = scene;
        start = function() {
            this.engine.run();
        }.bind(this);
    }

    this.adjustAspectRatio();

    /*
        For some reason, if we start the engine immediately,
        the performance is sluggish. Deferring it to end of call queue
        fixes it.
    */
    setTimeout(start, 0);
}

