Game.objects.Spawner = function()
{
    Engine.Object.call(this);
    this.ai = new Engine.AI(this);
    this.lifetime = undefined;
    this.minDistance = undefined;
    this.maxDistance = 256;
    this.maxSimultaneousSpawns = 1;
    this.roamingLimit = undefined;
    this.spawnCount = undefined;
    this.spawnInterval = undefined;
    this.spawnSource = [];
    this.spawnedObjects = new Set();
    this.timeSinceLastSpawn = 0;
}

Game.objects.Spawner.prototype = Object.create(Engine.Object.prototype);
Game.objects.Spawner.constructor = Game.objects.Spawner;

Game.objects.Spawner.prototype.cleanReferences = function()
{
    for (var object of this.spawnedObjects) {
        if (!this.world.objects.has(object)) {
            this.spawnedObjects.delete(object);
        }
    }
}

Game.objects.Spawner.prototype.killOffElderly = function()
{
    for (var object of this.spawnedObjects) {
        if (object.time >= this.lifetime) {
            object.kill();
            this.spawnedObjects.delete(object);
        }
    }
}

Game.objects.Spawner.prototype.killOffRoaming = function()
{
    for (var object of this.spawnedObjects) {
        if (object.position.distanceTo(this.position) > this.roamingLimit) {
            object.kill();
            this.spawnedObjects.delete(object);
        }
    }
}

Game.objects.Spawner.prototype.spawnObject = function()
{
    this.cleanReferences();
    if (this.spawnedObjects.size >= this.maxSimultaneousSpawns) {
        return false;
    }
    if (this.spawnCount < 1) {
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

    --this.spawnCount;
    var index = Math.floor(Math.random() * this.spawnSource.length);
    var object = new this.spawnSource[index]();
    object.position.copy(this.position);
    this.spawnedObjects.add(object);
    this.world.addObject(object);
    return object;
}

Game.objects.Spawner.prototype.timeShift = function(dt)
{
    this.timeSinceLastSpawn += dt;
    if (this.lifetime) {
        this.killOffElderly();
    }
    if (this.roamingLimit) {
        this.killOffRoaming();
    }

    if (this.timeSinceLastSpawn >= this.spawnInterval) {
        if (this.spawnObject()) {
            this.timeSinceLastSpawn = 0;
        }
    }
}
