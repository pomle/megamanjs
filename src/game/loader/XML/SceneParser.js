'use strict';

Game.Loader.XML.Parser.SceneParser =
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
    parseAudio(sceneNode)
    {
        const scene = this.getScene();
        const audioNodes = sceneNode.querySelectorAll('audio > *');
        for (let audioNode, i = 0; audioNode = audioNodes[i++];) {
            this.getAudio(audioNode)
                .then(audio => {
                    const id = this.getAttr(audioNode, 'id');
                    scene.audio[id] = audio;
                });
        }
    }
    parseEvents(sceneNode)
    {
        const eventNodes = sceneNode.querySelectorAll('events > event');
        for (let eventNode, i = 0; eventNode = eventNodes[i++];) {
            const name = this.getAttr(eventNode, 'name');
            const actionNodes = eventNode.querySelectorAll('action');
            for (let actionNode, j = 0; actionNode = actionNodes[j++];) {
                this._parseEventAction(name, actionNode);
            }
        }
    }
    _parseEventAction(eventName, actionNode)
    {
        const scene = this.getScene();
        const type = this.getAttr(actionNode, 'type');
        if (type === 'audio') {
            const id = this.getAttr(actionNode, 'id');
            scene.events.bind(eventName, () => {
                if (scene.game) {
                    scene.game.audioPlayer.play(scene.audio[id]);
                }
            });
        }
    }
}
