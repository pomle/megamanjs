const SceneParser = require('./SceneParser');
const Level = require('../../scene/Level');

const Spawner = require('../../object/Spawner');

class LevelParser extends SceneParser
{
    _parse()
    {
        if (this._node.tagName !== 'scene') {
            throw new TypeError('Node not <scene type="level">');
        }

        this._scene = new Level();

        this._parseAudio();
        this._parseEvents();
        this._parseMusic();
        this._parseBehaviors();
        this._parseCamera();
        this._parseCheckpoints();
        this._parseGravity();
        this._parseSequences();
        this._parseSpawners();
        this._parseText();

        return this._parseObjects().then(() => {
            return this._parseLayout();
        }).then(() => {
            return this._parseScripts();
        }).then(() => {
            return this.loader.resourceLoader.complete();
        }).then(() => {
            return this._scene;
        });
    }
    _parseCheckpoints()
    {
        const checkpointNodes = this._node.querySelectorAll(':scope > checkpoints > checkpoint');
        const level = this._scene;
        for (let checkpointNode, i = 0; checkpointNode = checkpointNodes[i]; ++i) {
            const p = this.getPosition(checkpointNode);
            const r = this.getFloat(checkpointNode, 'radius') || undefined;
            level.addCheckPoint(p.x, p.y, r);
        }
        return Promise.resolve();
    }
    _parseMusic()
    {
        const nodes = this._node.querySelectorAll(':scope > music > *');
        const scene = this._scene;
        for (let node, i = 0; node = nodes[i]; ++i) {
            const type = node.tagName;
            const id = this.getAttr(node, 'id')
            if (type === 'level') {
                scene.events.bind(scene.EVENT_PLAYER_RESET, function() {
                    this.audio.play(id);
                });
                scene.events.bind(scene.EVENT_PLAYER_DEATH, function() {
                    this.audio.stop(id);
                });
            } else if (type === 'boss') {
                /* Special boss music treatment here. */
            }
        }
    }
    _parseSpawners()
    {
        const world = this._scene.world;
        const spawnerNodes = this._node.querySelectorAll('layout > spawner');
        for (let spawnerNode, i = 0; spawnerNode = spawnerNodes[i]; ++i) {
            const spawner = new Spawner();
            const position = this.getPosition(spawnerNode);
            spawner.position.copy(position);
            spawner.position.z = 0;

            const spawnableNodes = spawnerNode.getElementsByTagName('*');
            for (let spawnableNode, j = 0; spawnableNode = spawnableNodes[j]; ++j) {
                const objectId = spawnableNode.getAttribute('id');
                const objectRef = this.loader.resourceManager.get('object', objectId);
                spawner.pool.push(objectRef);
            }

            spawner.maxTotalSpawns = this.getFloat(spawnerNode, 'count') || Infinity;
            spawner.maxSimultaneousSpawns = this.getFloat(spawnerNode, 'simultaneous') || 1;
            spawner.interval = this.getFloat(spawnerNode, 'interval') || 0;
            spawner.minDistance = this.getFloat(spawnerNode, 'min-distance') || 64;
            spawner.maxDistance = this.getFloat(spawnerNode, 'max-distance') || 256;

            world.addObject(spawner);
        }
        return Promise.resolve();
    }
    _parseScripts(scriptsNode, level)
    {
        const scriptNodes = this._node.querySelectorAll(':scope > scripts > *');
        for (let scriptNode, i = 0; scriptNode = scriptNodes[i++];) {
            const type = scriptNode.tagName;
            const func = eval(scriptNode.textContent);
            if (typeof func === "function") {
                if (type === 'bootstrap') {
                    func(this._scene);
                }
            }
        }
    }
    _parseText()
    {
        const res = this.loader.resourceManager;
        if (res.has('font', 'nintendo')) {
            this._scene.assets['start-caption'] = res.get('font', 'nintendo')('READY').createMesh();
        }
    }
}

module.exports = LevelParser;
