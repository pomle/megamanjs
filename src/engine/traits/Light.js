Engine.traits.Light =
class Light extends Engine.Trait
{
    constructor()
    {
        super();
        this.NAME = 'light';

        this.EVENT_LAMP_CHANGE = 'lamp_change';

        this.direction = new THREE.Vector2();
        this.events = new Engine.Events();

        this.lamps = [];
        this.threshold = .8;
        this.easeOn = Engine.Easing.easeOutElastic();
        this.easeOff = Engine.Easing.easeOutQuint();

        this._nextUpdate = 0;
        this._updateFrequency = 2.5;
    }
    __timeshift(deltaTime)
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
    _updateLight(deltaTime)
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
    _updateScene()
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
    _startLamp(lamp)
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
    _stopLamp(lamp)
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
    addLamp(light)
    {
        var lamp = new Engine.traits.Light.Lamp(light);
        this.lamps.push(lamp);
        return lamp;
    }
    on()
    {
        this._updateScene();
        this.lamps.forEach(lamp => {
            this._startLamp(lamp);
        });
    }
    off()
    {
        this.lamps.forEach(lamp => {
            this._stopLamp(lamp);
        });
    }
}

Engine.traits.Light.Lamp =
class Lamp
{
    constructor(light)
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
}
