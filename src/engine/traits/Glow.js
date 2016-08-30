Game.traits.Glow = function()
{
    Game.traits.Light.call(this);
}

Engine.Util.extend(Game.traits.Glow, Game.traits.Light);

Game.traits.Glow.prototype.NAME = 'glow';

Game.traits.Glow.prototype.__attach = function(host)
{
    Game.traits.Light.prototype.__attach.call(this, host);
    var model = this._host.model;
    this.lamps.forEach(function(lamp) {
        model.add(lamp.light);
    });
}

Game.traits.Glow.prototype.__detach = function()
{
    var model = this._host.model;
    this.lamps.forEach(function(lamp) {
        model.remove(lamp.light);
    });
    Game.traits.Light.prototype.__detach.call(this);
}
