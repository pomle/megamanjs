Megaman2.LevelParser =
class LevelParser
{
    constructor(loader, levelNode)
    {
        this.loader = loader;

        this.parser = new Engine.Loader.XML.Parser();

        this._result = levelNode.find(':scope > scene')
        .then(([sceneNode]) => {
            const parser = new Engine.Loader.XML.SceneParser(loader, sceneNode.node);
            return parser.getScene();
        })
        .then(scene => {
            return new Megaman2.Level(scene);
        })
        .then(level => {
            const node = levelNode.node
            return Promise.all([
                this.parseCheckpoints(node, level),
                this.parseMusic(node, level),
                this.parseSpawners(node, level),
                this.parseText(level),
                loader.resourceLoader.complete(),
            ])
            .then(() => level);
        });
    }
    getScene() {
        return this._result;
    }
    parseCheckpoints(levelNode, level)
    {
        const checkpointNodes = levelNode.querySelectorAll(':scope > checkpoints > checkpoint');
        for (let checkpointNode, i = 0; checkpointNode = checkpointNodes[i]; ++i) {
            const p = this.parser.getPosition(checkpointNode);
            const r = this.parser.getFloat(checkpointNode, 'radius') || undefined;
            level.addCheckPoint(p.x, p.y, r);
        }
    }
    parseMusic(levelNode, level)
    {
        const nodes = levelNode.querySelectorAll(':scope > music > *');
        const scene = level.scene;
        for (let node, i = 0; node = nodes[i]; ++i) {
            const type = node.tagName;
            const id = node.getAttribute('id');
            if (type === 'level') {
                level.events.bind(level.EVENT_PLAYER_RESET, function() {
                    scene.audio.play(id);
                });
                level.events.bind(level.EVENT_PLAYER_DEATH, function() {
                    scene.audio.stop(id);
                });
            } else if (type === 'boss') {
                /* Special boss music treatment here. */
            }
        }
    }
    parseSpawners(levelNode, level)
    {
        const world = level.scene.world;
        const spawnerNodes = levelNode.querySelectorAll('layout > spawner');
        for (let spawnerNode, i = 0; spawnerNode = spawnerNodes[i]; ++i) {
            const spawner = new Engine.objects.Spawner();
            const position = this.parser.getPosition(spawnerNode);
            spawner.position.copy(position);
            spawner.position.z = 0;

            const spawnableNodes = spawnerNode.getElementsByTagName('*');
            for (let spawnableNode, j = 0; spawnableNode = spawnableNodes[j]; ++j) {
                const objectId = spawnableNode.getAttribute('id');
                const objectRef = this.loader.resourceManager.get('entity', objectId);
                spawner.pool.push(objectRef);
            }

            spawner.maxTotalSpawns = this.parser.getFloat(spawnerNode, 'count') || Infinity;
            spawner.maxSimultaneousSpawns = this.parser.getFloat(spawnerNode, 'simultaneous') || 1;
            spawner.interval = this.parser.getFloat(spawnerNode, 'interval') || 0;
            spawner.minDistance = this.parser.getFloat(spawnerNode, 'min-distance') || 64;
            spawner.maxDistance = this.parser.getFloat(spawnerNode, 'max-distance') || 256;

            world.addObject(spawner);
        }
    }
    parseScripts(levelNode, level)
    {
        const scriptNodes = levelNode.querySelectorAll(':scope > scripts > *');
        for (let scriptNode, i = 0; scriptNode = scriptNodes[i++];) {
            const type = scriptNode.tagName;
            const func = eval(scriptNode.textContent);
            if (typeof func === "function") {
                if (type === 'bootstrap') {
                    func(level.scene);
                }
            }
        }
    }
    parseText(level)
    {
        const res = this.loader.resourceManager;
        if (res.has('font', 'nintendo')) {
            level.assets['start-caption'] = res.get('font', 'nintendo')('READY').createMesh();
        }
    }
}