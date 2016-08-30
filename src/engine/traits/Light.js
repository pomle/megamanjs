Engine.traits.Light = function()
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

Engine.Util.extend(Engine.traits.Light, Engine.Trait);

Engine.traits.Light.prototype.EVENT_LAMP_CHANGE = 'lamp_change';

Engine.traits.Light.prototype.NAME = 'headlight';

Engine.traits.Light.prototype.__timeshift = function lightTimeshift(deltaTime)
{
    if (this._nextUpdate > this._updateFrequency) {
        this._nextUpdate = 0;
        if (this._host.world === undefined) {
            return;
        }
        const ambientLight = this._host.world.ambientLight;
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

Engine.traits.Light.prototype._updateLight = function(deltaTime)
{
    const host = this._host;

    /* Ensure lights are always in Z front of host no matter rotation. */
    if (host.direction.x !== this.direction.x) {
        this.lamps.forEach(lamp => {
            const dist = Math.abs(lamp.light.position.z);
            lamp.light.position.z = host.direction.x > 0 ? dist : -dist;
        })
        this.direction.x = host.direction.x;
    }
}

Engine.traits.Light.prototype._updateScene = function()
{
    const host = this._host;
    this.lamps.forEach(lamp => {
        host.model.remove(lamp.light);
        host.model.add(lamp.light);
    });

    if (host.world) {
        host.world.scene.children.forEach(function(mesh) {
            if (mesh.material) {
                mesh.material.needsUpdate = true;
            }
        });
    }
}

Engine.traits.Light.prototype._startLamp = function(lamp)
{
    if (lamp.state === true) {
        return;
    }
    lamp.state = true;
    const tween = new Engine.Tween({intensity: lamp.intensity}, this.easeOn);
    tween.addSubject(lamp.light);
    this._host.doFor(lamp.heatUpTime, (elapsed, progress) => {
        tween.update(progress);
    });
}

Engine.traits.Light.prototype._stopLamp = function(lamp)
{
    if (lamp.state === false) {
        return;
    }
    lamp.state = false;
    const tween = new Engine.Tween({intensity: 0}, this.easeOff);
    tween.addSubject(lamp.light);
    this._host.doFor(lamp.coolDownTime, (elapsed, progress) => {
        tween.update(progress);
    });
}

Engine.traits.Light.prototype.addLamp = function(light)
{
    var lamp = new Engine.traits.Light.Lamp(light);
    this.lamps.push(lamp);
    return lamp;
}

Engine.traits.Light.prototype.on = function()
{
    this._updateScene();
    this.lamps.forEach(lamp => {
        this._startLamp(lamp);
    });
}

Engine.traits.Light.prototype.off = function()
{
    this.lamps.forEach(lamp => {
        this._stopLamp(lamp);
    });
}

Engine.traits.Light.Lamp = function(light)
{
    if (light === undefined) {
        this.light = new THREE.SpotLight(0xffffff, 0, 100);
    }
    else {
        this.light = light;
    }

    this.coolDownTime = 1;
    this.heatUpTime = .8;
    this.intensity = this.light.intensity;

    this.light.intensity = 0;
    this.state = false;
}
