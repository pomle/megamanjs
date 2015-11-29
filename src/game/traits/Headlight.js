Game.traits.Headlight = function()
{
    Game.traits.Light.call(this);

    var target = new THREE.Object3D();
    target.position.set(200, -10, 0);

    this.beam = new THREE.SpotLight(0x8cc6ff, 20, 256);
    this.beam.angle = .6;
    this.beam.exponent = 50;
    this.beam.position.y = 11;
    this.beam.target = target;

    this.lamps = [
        new Game.traits.Light.Lamp(this.beam),
    ];
}

Engine.Util.extend(Game.traits.Headlight, Game.traits.Light);

Game.traits.Headlight.prototype.NAME = 'headlight';

Game.traits.Headlight.prototype.__attach = function(host)
{
    Game.traits.Light.prototype.__attach.call(this, host);
    this._host.model.add(this.lamps[0].light);
    this._host.model.add(this.lamps[0].light.target);
}

Game.traits.Headlight.prototype.__detach = function()
{
    this._host.model.remove(this.lamps[0].light);
    this._host.model.remove(this.lamps[0].light.target);
    Game.traits.Light.prototype.__detach.call(this);
}
