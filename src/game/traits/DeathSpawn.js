Game.traits.DeathSpawn = function()
{
    Engine.Trait.call(this);

    this.chance = 1;
    this.pool = [];

    this.spawn = this.spawn.bind(this);
}

Engine.Util.extend(Game.traits.DeathSpawn, Engine.Trait);

Game.traits.DeathSpawn.prototype.NAME = 'deathSpawn';

Game.traits.DeathSpawn.prototype.off = function()
{
    var host = this._host;
    host.unbind(host.EVENT_DEATH, this.spawn);
}

Game.traits.DeathSpawn.prototype.on = function()
{
    var host = this._host;
    host.bind(host.EVENT_DEATH, this.spawn);
}

Game.traits.DeathSpawn.prototype.spawn = function()
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
        host.world.addObject(object);
    }
}
