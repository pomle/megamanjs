Game.traits.Light = function()
{
    Engine.Trait.call(this);

    this.lamps = [];
    this.threshold = .8;
    this.easeOn = Engine.Easing.easeOutElastic;
    this.easeOff = Engine.Easing.easeOutQuint;

    this._tweens = [];
    this._nextUpdate = 0;
    this._updateFrequency = 2.5;
}

Engine.Util.extend(Game.traits.Light, Engine.Trait);

Game.traits.Light.prototype.NAME = 'headlight';

Game.traits.Light.prototype.__timeshift = function lightTimeshift(deltaTime)
{
    if (this._nextUpdate > this._updateFrequency) {
        this._nextUpdate = 0;
        if (this._host.world === undefined) {
            return;
        }
        var ambientLight = this._host.world.ambientLight;
        if (ambientLight.color.r < this.threshold
        || ambientLight.color.g < this.threshold
        || ambientLight.color.b < this.threshold) {
            this.on();
        }
        else {
            this.off();
        }
    }
    this._nextUpdate += deltaTime;

    this._updateLight(deltaTime);
}

Game.traits.Light.prototype._updateLight = function(deltaTime)
{
    if (this._tweens.length === 0) {
        return;
    }
    for (var i = 0, l = this._tweens.length; i !== l; ++i) {
        var t = this._tweens[i];
        t.updateTime(deltaTime);
        if (t.progress >= t.duration) {
            this._tweens.splice(i, 1);
            --i;
            --l;
        }
    }
}

Game.traits.Light.prototype._updateScene = function()
{
    var host = this._host;
    for (var i = 0, l = this.lamps.length; i !== l; ++i) {
        host.model.add(this.lamps[i].light);
    }

    host.world.scene.children.forEach(function(mesh) {
        if (mesh.material) {
            mesh.material.needsUpdate = true;
        }
    });
}

Game.traits.Light.prototype._startLamp = function(lamp)
{
    lamp.state = true;
    var tween = new Engine.Tween(
        {intensity: lamp.intensity},
        this.easeOn,
        lamp.heatUpTime);
    tween.addObject(lamp.light);
    tween.progress = -1;
    this._tweens.push(tween);
}

Game.traits.Light.prototype._stopLamp = function(lamp)
{
    lamp.state = false;
    var tween = new Engine.Tween(
        {intensity: 0},
        this.easeOff,
        lamp.coolDownTime);
    tween.addObject(lamp.light);
    this._tweens.push(tween);
}

Game.traits.Light.prototype.addLamp = function(light)
{
    var lamp = new Game.traits.Light.Lamp(light);
    this.lamps.push(lamp);
    return lamp;
}

Game.traits.Light.prototype.on = function()
{
    this._updateScene();
    for (var i = 0, l = this.lamps.length; i !== l; ++i) {
        var lamp = this.lamps[i];
        if (lamp.state === false) {
            this._startLamp(lamp);
        }
    }
}

Game.traits.Light.prototype.off = function()
{
    for (var i = 0, l = this.lamps.length; i !== l; ++i) {
        var lamp = this.lamps[i];
        if (lamp.state === true) {
            this._stopLamp(lamp);
        }
    }
}

Game.traits.Light.Lamp = function(light)
{
    if (light === undefined) {
        this.light = new THREE.SpotLight(0xffffff, 0, 100);
    }
    else {
        this.light = light;
    }

    this.coolDownTime = 1;
    this.heatUpTime = .8;
    this.intensity = light.intensity;

    this.light.position.z = 20;
    this.light.intensity = 0;
    this.state = false;
}
