const {SpotLight, Vector2} = require('three');
const Easing = require('../Easing');
const Events = require('../Events');
const Trait = require('../Trait');
const Tween = require('../Tween');

class Light extends Trait
{
    constructor()
    {
        super();
        this.NAME = 'light';

        this.EVENT_LAMP_CHANGE = 'lamp_change';

        this.direction = new Vector2();
        this.events = new Events();

        this.lamps = [];
        this.threshold = .8;
        this.easeOn = Easing.easeOutElastic();
        this.easeOff = Easing.easeOutQuint();

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
        const tween = new Tween({intensity: lamp.intensity}, this.easeOn);
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
        const tween = new Tween({intensity: 0}, this.easeOff);
        tween.addSubject(lamp.light);
        this._host.doFor(lamp.coolDownTime, (elapsed, progress) => {
            tween.update(progress);
        });
    }
    addLamp(light)
    {
        const lamp = new Lamp(light);
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

class Lamp
{
    constructor(light)
    {
        if (light === undefined) {
            this.light = new SpotLight(0xffffff, 0, 100);
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

Light.Lamp = Lamp;

module.exports = Light;
