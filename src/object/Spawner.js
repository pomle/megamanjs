Engine.assets.Spawner = function()
{
    Engine.assets.Object.call(this);
    this.maxSimultaneousSpawns = 1;
    this.spawnCount = undefined;
    this.spawnInterval = undefined;
    this.spawnSource = [];
    this.spawnedObjects = [];
    this.timeSinceLastSpawn = 0;
}

Engine.assets.Spawner.prototype = Object.create(Engine.assets.Object.prototype);
Engine.assets.Spawner.constructor = Engine.assets.Spawner;

Engine.assets.Spawner.prototype.cleanReferences = function()
{
    for (var i in this.spawnedObjects) {
        if (this.scene.objects.indexOf(this.spawnedObjects[i]) == -1) {
            this.spawnedObjects.splice(i, 1);
        }
    }
}

Engine.assets.Spawner.prototype.spawnObject = function()
{
    var l = this.spawnSource.length;
    var i = Math.floor(Math.random() * l);
    var object = new this.spawnSource[i]();
    object.position.copy(this.position);

    this.spawnedObjects.push(object);
    this.scene.addObject(object);
}

Engine.assets.Spawner.prototype.timeShift = function(dt)
{
    if (this.spawnCount < 1) {
        return;
    }

    this.timeSinceLastSpawn += dt;
    if (this.timeSinceLastSpawn >= this.spawnInterval) {
        this.cleanReferences();
        if (this.maxSimultaneousSpawns > this.spawnedObjects.length) {
            this.spawnObject();
            this.spawnCount--;
            this.timeSinceLastSpawn = 0;
        }
    }
}
