'use strict';

Game.Loader.XML.Parser.SceneParser =
class SceneParser
extends Game.Loader.XML.Parser
{
    parseEvents(sceneNode)
    {
        const scene = this._scene;
        const eventNodes = sceneNode.querySelectorAll('events > event');
        for (let eventNode, i = 0; eventNode = eventNodes[i++];) {
            const name = this.getAttr(eventNode, 'name');
            const actionNodes = eventNode.querySelectorAll('action');
            for (let actionNode, j = 0; actionNode = actionNodes[j++];) {
                const type = this.getAttr(actionNode, 'type');
                if (type === 'audio') {
                    const id = this.getAttr(actionNode, 'id');
                    scene.events.bind(name, () => {
                        if (scene.game) {
                            scene.game.audioPlayer.play(scene.audio[id]);
                        }
                    });
                }
            }
        }
    }
}
