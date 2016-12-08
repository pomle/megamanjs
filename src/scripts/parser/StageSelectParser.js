'use strict';

Megaman2.StageSelectParser =
class StageSelectParser
{
    constructor(loader, node)
    {
        this.loader = loader;

        this._result = node.find(':scope > scene')
        .then(([sceneNode]) => {
            const parser = new Engine.Loader.XML.SceneParser(loader, sceneNode.node);
            return parser.getScene();
        })
        .then(scene => {
            const stageSelect = new Megaman2.StageSelect(scene);
            return Promise.all([
                this._parseLayout(node, stageSelect),
                this._parseReveal(node, stageSelect),
            ])
            .then(() => {
                return stageSelect;
            });
        });
    }
    getScene() {
        return this._result;
    }
    _createCaption(text)
    {
        text = text.split(" ");
        text[1] = Engine.Util.string.fill(" ", 6 - text[1].length) + text[1];
        text = text.join("\n");
        return this.loader.resourceManager.get('font', 'nintendo')(text).createMesh();
    }
    _parseLayout(stageSelectNode, stageSelect)
    {
        const parser = new Engine.Loader.XML.Parser();

        const node = stageSelectNode.node;
        const objects = this._objects;
        const res = this.loader.resourceManager;

        const backgroundNode = node.getElementsByTagName('background')[0];
        const cameraNode = node.getElementsByTagName('camera')[0];
        const indicatorNode = node.getElementsByTagName('indicator')[0];
        const spacingNode = node.querySelector('spacing');

        stageSelect.setBackgroundColor(parser.getAttr(backgroundNode, 'color'));
        stageSelect.setBackgroundModel(this._createObject('background').model);
        stageSelect.setIndicator(this._createObject('indicator').model);
        stageSelect.setFrame(this._createObject('frame').model);

        if (spacingNode) {
            stageSelect.spacing.copy(parser.getVector2(spacingNode));
        }
        if (cameraNode) {
            stageSelect.cameraDistance = parser.getFloat(cameraNode, 'distance');
        }
        if (indicatorNode) {
            stageSelect.indicatorInterval = parser.getFloat(indicatorNode, 'blink-interval');
        }

        const stagesNode = node.getElementsByTagName('stage');
        stageSelect.rowLength = Math.ceil(Math.sqrt(stagesNode.length));
        for (let stageNode, i = 0; stageNode = stagesNode[i++];) {
            const id = parser.getAttr(stageNode, 'id')
            const name = parser.getAttr(stageNode, 'name');
            const text = parser.getAttr(stageNode, 'caption');
            const caption = this._createCaption(text);
            const avatar = this._createObject(id).model;
            const characterId = parser.getAttr(stageNode, 'character');
            stageSelect.addStage(avatar, caption, name, characterId && res.get('object', characterId));
        }

        const initialIndex = parser.getInt(indicatorNode, 'initial-index') || 0;
        stageSelect.initialIndex = initialIndex;
    }
    _parseReveal(stageSelectNode, stageSelect)
    {
        const node = stageSelectNode.node;

        const starNodes = this._node.querySelectorAll(':scope > layout > stars > star');
        for (let node, i = 0; node = starNodes[i]; ++i) {
            const id = this.getAttr(node, 'object');
            const count = this.getInt(node, 'count');
            const depth = this.getFloat(node, 'depth') || 0;
            for (let j = 0; j < count; ++j) {
                const model = this._createObject(id).model;
                model.position.z = -depth;
                stageSelect.addStar(model, depth);
            }
        }

        const podiumNode = this._node.querySelector(':scope > layout > podium');
        if (podiumNode) {
            const id = this.getAttr(podiumNode, 'object');
            stageSelect.setPodium(this._createObject(id).model);
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