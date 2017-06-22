import SceneParser from './SceneParser';
import StageSelect from '../../scene/StageSelect';
import Util from '../../Util';

class StageSelectParser extends SceneParser
{
    constructor(loader, node)
    {
        if (node.tagName !== 'scene' || node.getAttribute('type') !== 'stage-select') {
            throw new TypeError('Node not <scene type="stage-select">');
        }

        super(loader, node);
    }
    _parse()
    {
        this._scene = new StageSelect;

        this._parseAudio();
        this._parseEvents();
        this._setupBehavior();
        return this._parseObjects().then(() => {
            return this._parseLayout();
        }).then(() => {
            return this.loader.resourceLoader.complete();
        }).then(() => {
            return this._scene;
        });
    }
    _createCaption(text)
    {
        text = text.split(" ");
        text[1] = Util.string.fill(" ", 6 - text[1].length) + text[1];
        text = text.join("\n");
        return this.loader.resourceManager.get('font', 'nintendo')(text).createMesh();
    }
    _parseLayout()
    {
        const sceneNode = this._node;
        const scene = this._scene;
        const objects = this._objects;
        const res = this.loader.resourceManager;

        const backgroundNode = sceneNode.getElementsByTagName('background')[0];
        const cameraNode = sceneNode.getElementsByTagName('camera')[0];
        const indicatorNode = sceneNode.getElementsByTagName('indicator')[0];
        const spacingNode = sceneNode.querySelector('spacing');

        scene.setBackgroundColor(this.getAttr(backgroundNode, 'color'));
        scene.setBackgroundModel(this._createObject('background').model);
        scene.setIndicator(this._createObject('indicator').model);
        scene.setFrame(this._createObject('frame').model);

        if (spacingNode) {
            scene.spacing.copy(this.getVector2(spacingNode));
        }
        if (cameraNode) {
            scene.cameraDistance = this.getFloat(cameraNode, 'distance');
        }
        if (indicatorNode) {
            scene.indicatorInterval = this.getFloat(indicatorNode, 'blink-interval');
        }

        const stagesNode = sceneNode.getElementsByTagName('stage');
        scene.rowLength = Math.ceil(Math.sqrt(stagesNode.length));
        for (let stageNode, i = 0; stageNode = stagesNode[i++];) {
            const id = this.getAttr(stageNode, 'id')
            const name = this.getAttr(stageNode, 'name');
            const text = this.getAttr(stageNode, 'caption');
            const caption = this._createCaption(text);
            const avatar = this._createObject(id).model;
            const characterId = this.getAttr(stageNode, 'character');
            scene.addStage(avatar, caption, name, characterId && res.get('object', characterId));
        }

        this._parseReveal();

        const initialIndex = this.getInt(indicatorNode, 'initial-index') || 0;
        scene.initialIndex = initialIndex;

        return Promise.resolve();
    }
    _parseReveal()
    {
        const starNodes = this._node.querySelectorAll(':scope > layout > stars > star');
        for (let node, i = 0; node = starNodes[i]; ++i) {
            const id = this.getAttr(node, 'object');
            const count = this.getInt(node, 'count');
            const depth = this.getFloat(node, 'depth') || 0;
            for (let j = 0; j < count; ++j) {
                const model = this._createObject(id).model;
                model.position.z = -depth;
                this._scene.addStar(model, depth);
            }
        }

        const podiumNode = this._node.querySelector(':scope > layout > podium');
        if (podiumNode) {
            const id = this.getAttr(podiumNode, 'object');
            this._scene.setPodium(this._createObject(id).model);
        }
    }
    _setupBehavior()
    {
        const stageSelectScene = this._scene;
        const game = this.loader.game;
        this._scene.events.bind(this._scene.EVENT_STAGE_ENTER, (stage, index) => {
            try {
                this.loader.loadSceneByName(stage.name).then(scene => {
                    scene.events.bind(scene.EVENT_END, () => {
                        game.setScene(stageSelectScene);
                    });
                    game.setScene(scene);
                });
            } catch (err) {
                game.setScene(stageSelectScene);
            }
        });
    }
}

export default StageSelectParser;
