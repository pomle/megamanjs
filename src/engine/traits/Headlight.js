const THREE = require('three');
const Light = require('./Light');

class Headlight extends Light
{
    constructor()
    {
        super();
        this.NAME = 'headlight';

        this.position = new THREE.Vector3(4, 7.5, -1);

        const target = new THREE.Object3D();
        target.position.set(200, -10, 0);

        this.beam = new THREE.SpotLight(0x8cc6ff, 20, 256);
        this.beam.angle = .6;
        this.beam.exponent = 50;
        this.beam.position.y = 7.5;
        this.beam.position.z = 6;
        this.beam.target = target;

        this.point = new THREE.PointLight(0x8cc6ff, 5, 30);
        this.point.position.copy(this.position);

        this.flare = new THREE.Mesh(
            new THREE.PlaneGeometry(64, 64),
            new THREE.MeshBasicMaterial({
                opacity: 0,
                side: THREE.DoubleSide,
                transparent: true,
            }));

        this.point.add(this.flare);

        this.headbob = 2;

        this.lamps = [
            new Light.Lamp(this.beam),
            new Light.Lamp(this.point),
        ];
    }
    __attach(host)
    {
        if (host.textures['headlight_lensflare']) {
            this.flare.material.map = host.textures['headlight_lensflare'].texture;
            this.flare.material.needsUpdate = true;
        }

        super.__attach(host);
        this._host.model.add(this.lamps[0].light);
        this._host.model.add(this.lamps[0].light.target);
    }
    __detach()
    {
        this.flare.material.map = undefined;
        this.flare.material.needsUpdate = true;

        this._host.model.remove(this.lamps[0].light);
        this._host.model.remove(this.lamps[0].light.target);
        super.__detach();
    }
    __timeshift(deltaTime)
    {
        const
            host = this._host,
            animator = host.animators[0];

        this.flare.material.opacity = this.point.intensity / this.lamps[1].intensity;

        this.point.position.y = this.beam.position.y = this.position.y;
        if (animator._currentAnimation === host.animations.run) {
            if (animator._currentIndex === 1 || animator._currentIndex === 3) {
                this.point.position.y = this.beam.position.y -= this.headbob;
            }
        }

        super.__timeshift.apply(this, arguments);
    }
}

module.exports = Headlight;
