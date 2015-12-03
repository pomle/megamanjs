Game.traits.Light = function()
{
    Engine.Trait.call(this);

    this.direction = new THREE.Vector2();
    this.events = new Engine.Events();

    this.lamps = [];
    this.threshold = .8;
    this.easeOn = Engine.Easing.easeOutElastic;
    this.easeOff = Engine.Easing.easeOutQuint;

    this._nextUpdate = 0;
    this._updateFrequency = 2.5;
}

Engine.Util.extend(Game.traits.Light, Engine.Trait);

Game.traits.Light.prototype.EVENT_LAMP_CHANGE = 'lamp_change';

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

    this._updateLight(deltaTime);

    this._nextUpdate += deltaTime;
}

Game.traits.Light.prototype._updateLight = function(deltaTime)
{
    var host = this._host,
        lamps = this.lamps;

    for (var i = 0, l = this.lamps.length; i !== l; ++i) {
        var lamp = this.lamps[i];
        if (lamp.tween !== undefined) {
            var tween = lamp.tween;
            tween.updateTime(deltaTime);
            this.events.trigger(this.EVENT_LAMP_CHANGE, [lamp]);
            if (tween.progress >= tween.duration) {
                lamp.tween = undefined;
            }
        }
    }

    /* Ensure lights are always in Z front of host no matter rotation. */
    if (host.direction.x !== this.direction.x) {
        for (var i = 0, l = this.lamps.length; i !== l; ++i) {
            var lamp = this.lamps[i],
                dist = Math.abs(lamp.light.position.z);
            lamp.light.position.z = host.direction.x > 0 ? dist : -dist;
        }
        this.direction.x = host.direction.x;
    }

}

Game.traits.Light.prototype._updateScene = function()
{
    var host = this._host;
    for (var i = 0, l = this.lamps.length; i !== l; ++i) {
        host.model.remove(this.lamps[i].light);
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
    tween.progress = 0;
    lamp.tween = tween;
}

Game.traits.Light.prototype._stopLamp = function(lamp)
{
    lamp.state = false;
    var tween = new Engine.Tween(
        {intensity: 0},
        this.easeOff,
        lamp.coolDownTime);
    tween.addObject(lamp.light);
    lamp.tween = tween;
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

    this.light.intensity = 0;
    this.state = false;

    this.tween = undefined;
}
