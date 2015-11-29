Game.objects.Spawner = function()
{
    Engine.Object.call(this);

    this._timeSinceLastSpawn = 0;

    this.ai = new Engine.AI(this);
    this.children = new Set();
    this.count = Infinity;
    this.lifetime = undefined;
    this.maxDistance = 256;
    this.minDistance = 32;
    this.maxSimultaneousSpawns = 1;
    this.interval = 0;
    this.pool = [];
    this.roamingLimit = undefined;
    this.spawns = 0;
}

Game.objects.Spawner.prototype = Object.create(Engine.Object.prototype);
Game.objects.Spawner.constructor = Game.objects.Spawner;

Game.objects.Spawner.prototype.cleanReferences = function()
{
    for (var object of this.children) {
        if (!this.world.objects.has(object)) {
            this.children.delete(object);
        }
    }
}

Game.objects.Spawner.prototype.killOffElderly = function()
{
    for (var object of this.children) {
        if (object.time >= this.lifetime) {
            object.kill();
            this.children.delete(object);
        }
    }
}

Game.objects.Spawner.prototype.killOffRoaming = function()
{
    for (var object of this.children) {
        if (object.position.distanceTo(this.position) > this.roamingLimit) {
            object.kill();
            this.children.delete(object);
        }
    }
}

Game.objects.Spawner.prototype.reset = function()
{
    this.spawns = 0;
}

Game.objects.Spawner.prototype.spawnObject = function()
{
    this.cleanReferences();
    if (this.children.size >= this.maxSimultaneousSpawns) {
        return false;
    }
    if (this.spawns >= this.count || this.pool.length === 0) {
        return false;
    }

    if (this.minDistance || this.maxDistance) {
        var player = this.ai.findPlayer();
        if (player) {
            var dist = this.position.distanceTo(player.position);
            if (dist > this.maxDistance || dist < this.minDistance) {
                return false;
            }
        }
    }

    ++this.spawns;
    var index = Math.floor(Math.random() * this.pool.length);
    var object = new this.pool[index]();
    object.position.copy(this.position);
    object.position.z = 0;
    this.children.add(object);
    this.world.addObject(object);
    return object;
}

Game.objects.Spawner.prototype.timeShift = function(dt)
{
    this._timeSinceLastSpawn += dt;
    if (this.lifetime !== undefined) {
        this.killOffElderly();
    }
    if (this.roamingLimit !== undefined) {
        this.killOffRoaming();
    }

    if (this._timeSinceLastSpawn >= this.interval) {
        if (this.spawnObject()) {
            this._timeSinceLastSpawn = 0;
        }
    }
}
