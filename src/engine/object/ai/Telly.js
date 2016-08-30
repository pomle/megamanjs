Engine.ai.Telly = function()
{
    Engine.Trait.call(this);
    this._timeLastUpdated = undefined;
    this._updateInterval = 1;
}

Engine.Util.extend(Engine.ai.Telly, Engine.Trait);

Engine.traits.Teleport.prototype.__timeshift = function(dt)
{
    if (Math.abs(this._host.time - this._timeLastUpdated) < this._updateInterval) {
        return;
    }

    this._updateAI();
}

Engine.traits.Teleport.prototype._updateAI = function()
{
    this._timeLastUpdated = this._host.time;

    var host = this._host;
    if (host.ai.findPlayer()) {
        if (host.ai.target.position.distanceTo(host.position) > 300) {
            return;
        }
        host.ai.faceTarget();
        host.velocity.x = 0;
        host.velocity.y = 0;
        var distX = host.position.x - host.ai.target.position.x;
        var distY = host.position.y - host.ai.target.position.y;
        host.velocity.x = distX > 0 ? -host.speed : host.speed;
        if (Math.abs(distY) > 16 || Math.random() < .25) {
            host.velocity.y = distY > 0 ? -host.speed : host.speed;
        }
    }
}
