'use strict';

Game.Loader.XML.SceneParser =
class SceneParser
extends Game.Loader.XML.Parser
{
    constructor(loader, scene)
    {
        super(loader);
        this._scene = scene;
    }
    getScene()
    {
        return this._scene;
    }
    _parseAudio(sceneNode)
    {
        const scene = this.getScene();
        const nodes = this._node.querySelectorAll(':scope > audio > *');
        const tasks = [];
        for (let node, i = 0; node = nodes[i++];) {
            const id = this.getAttr(node, 'id');
            const task = this.getAudio(node).then(audio => {
                scene.audio[id] = audio;
            });
            tasks.push(task);
        }
        return Promise.all(tasks);
    }
    _parseEvents()
    {
        const node = this._node.querySelector(':scope > events');
        if (!node) {
            return Promise.resolve();
        }

        const parser = new Game.Loader.XML.EventParser(this.loader, node);
        return parser.getEvents().then(events => {
            const scene = this.getScene();
            events.forEach(event => {
                scene.events.bind(event.name, event.callback);
            });
        });
    }
}
