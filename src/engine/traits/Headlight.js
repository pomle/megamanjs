Engine.traits.Headlight = function()
{
    Engine.traits.Light.call(this);

    this.position = new THREE.Vector3(4, 7.5, -1);

    var target = new THREE.Object3D();
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
        new Engine.traits.Light.Lamp(this.beam),
        new Engine.traits.Light.Lamp(this.point),
    ];
}

Engine.Util.extend(Engine.traits.Headlight, Engine.traits.Light);

Engine.traits.Headlight.prototype.NAME = 'headlight';

Engine.traits.Headlight.prototype.__attach = function(host)
{
    if (host.textures['headlight_lensflare']) {
        this.flare.material.map = host.textures['headlight_lensflare'].texture;
        this.flare.material.needsUpdate = true;
    }

    Engine.traits.Light.prototype.__attach.call(this, host);
    this._host.model.add(this.lamps[0].light);
    this._host.model.add(this.lamps[0].light.target);
}

Engine.traits.Headlight.prototype.__detach = function()
{
    this.flare.material.map = undefined;
    this.flare.material.needsUpdate = true;

    this._host.model.remove(this.lamps[0].light);
    this._host.model.remove(this.lamps[0].light.target);
    Engine.traits.Light.prototype.__detach.call(this);
}

Engine.traits.Headlight.prototype.__timeshift = function(deltaTime)
{
    var host = this._host,
        animator = host.animators[0];

    this.flare.material.opacity = this.point.intensity / this.lamps[1].intensity;

    this.point.position.y = this.beam.position.y = this.position.y;
    if (animator._currentAnimation === host.animations.run) {
        if (animator._currentIndex === 1 || animator._currentIndex === 3) {
            this.point.position.y = this.beam.position.y -= this.headbob;
        }
    }

    Engine.traits.Light.prototype.__timeshift.apply(this, arguments);
}
