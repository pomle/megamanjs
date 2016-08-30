Engine.traits.Glow = function()
{
    Engine.traits.Light.call(this);
}

Engine.Util.extend(Engine.traits.Glow, Engine.traits.Light);

Engine.traits.Glow.prototype.NAME = 'glow';

Engine.traits.Glow.prototype.__attach = function(host)
{
    Engine.traits.Light.prototype.__attach.call(this, host);
    var model = this._host.model;
    this.lamps.forEach(function(lamp) {
        model.add(lamp.light);
    });
}

Engine.traits.Glow.prototype.__detach = function()
{
    var model = this._host.model;
    this.lamps.forEach(function(lamp) {
        model.remove(lamp.light);
    });
    Engine.traits.Light.prototype.__detach.call(this);
}
