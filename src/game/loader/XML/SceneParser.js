'use strict';

Game.Loader.XML.SceneParser =
class SceneParser
extends Game.Loader.XML.Parser
{
    constructor(loader, scene)
    {
        super(loader);
        this._scene = scene;
        this._objects = {};
    }
    getScene()
    {
        if (!this._promise) {
            this._promise = this._parse();
        }
        return this._promise;
    }
    _createObject(id)
    {
        if (!this._objects[id]) {
            throw new Error(`Object "${id}" no defined.`);
        }
        return new this._objects[id].constructor;
    }
    _parseAudio(sceneNode)
    {
        const scene = this._scene;
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
            const scene = this._scene;
            events.forEach(event => {
                scene.events.bind(event.name, event.callback);
            });
        });
    }
    _parseObjects()
    {
        const node = this._node.querySelector(':scope > objects');
        if (!node) {
            return Promise.resolve();
        }

        const parser = new Game.Loader.XML.ObjectParser(this.loader, node);
        return parser.getObjects().then(objects => {
            this._objects = objects;
        });
    }
}
