Game.objects.Spawner = function() {
    Engine.Object.call(this);

    this._timeSinceLastSpawn = 0;

    this.ai = new Engine.AI(this);
    this.children = [];
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

Engine.Util.extend(Game.objects.Spawner, Engine.Object, {
    cleanReferences: function() {
        var world = this.world;
        var object;
        for (var i = 0, l = this.children.length; i !== l; ++i) {
            if (!world.hasObject(this.children[i])) {
                this.children.splice(i, 1);
                --i;
                --l;
            }
        }
    },
    killOffElderly: function() {
        var object;
        for (var i = 0, l = this.children.length; i !== l; ++i) {
            object = this.children[i];
            if (object.time >= this.lifetime) {
                object.kill();
            }
        }
    },
    killOffRoaming: function() {
        var object;
        for (var i = 0, l = this.children.length; i !== l; ++i) {
            object = this.children[i];
            if (object.position.distanceTo(this.position) > this.roamingLimit) {
                object.kill();
                this.children.splice(i, 1);
                --i;
                --l;
            }
        }
    },
    reset: function() {
        this.spawns = 0;
    },
    spawnObject: function() {
        if (this.children.length >= this.maxSimultaneousSpawns) {
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
        this.children.push(object);
        this.world.addObject(object);
        return object;
    },
    timeShift: function(dt) {
        this._timeSinceLastSpawn += dt;
        if (this.lifetime !== undefined) {
            this.killOffElderly();
        }
        if (this.roamingLimit !== undefined) {
            this.killOffRoaming();
        }

        if (this._timeSinceLastSpawn >= this.interval) {
            this.cleanReferences();
            if (this.spawnObject()) {
                this._timeSinceLastSpawn = 0;
            }
        }
    },
});