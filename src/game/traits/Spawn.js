Game.traits.Spawn = function()
{
    Engine.Trait.call(this);

    this.chance = 1;
    this.offset = new THREE.Vector2();
    this.pool = [];
    this.spawn = this.spawn.bind(this);
}

Engine.Util.extend(Game.traits.Spawn, Engine.Trait);

Game.traits.Spawn.prototype.NAME = 'spawn';

Game.traits.Spawn.prototype.__attach = function()
{
    Engine.Trait.prototype.__attach.apply(this, arguments);
    var host = this._host;
    host.events.bind(host.EVENT_RECYCLE, this.spawn);
}

Game.traits.Spawn.prototype.__detach = function()
{
    var host = this._host;
    host.events.unbind(host.EVENT_RECYCLE, this.spawn);
    Engine.Trait.prototype.__detach.apply(this, arguments);
}

Game.traits.Spawn.prototype.spawn = function()
{
    if (this.pool.length !== 0) {
        var rand = Math.random();
        if (this.chance < rand) {
            return;
        }
        var host = this._host,
            index = Math.floor(rand * this.pool.length),
            object = new this.pool[index]();

        object.position.copy(host.position);
        object.position.x += this.offset.x;
        object.position.y += this.offset.y;
        host.world.addObject(object);
    }
}
