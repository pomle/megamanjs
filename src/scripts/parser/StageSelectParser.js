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
            return new Megaman2.StageSelect(scene);
        })
        .then(stageSelect => {
            this._parseLayout(node, stageSelect);
            return loader.resourceLoader.complete()
            .then(() => stageSelect);
        });
    }
    getScene() {
        return this._result;
    }
    _parseLayout(stageSelectNode, stageSelect)
    {
        const parser = new Engine.Loader.XML.Parser();
        const scene = stageSelect.scene;
        const node = stageSelectNode.node;
        const objects = this._objects;
        const res = this.loader.resourceManager;

        function createCaption(string) {
            const lines = string.split(' ');
            lines[1] = Engine.Util.string.fill(' ', 6 - lines[1].length) + lines[1];
            const text = lines.join('\n');
            return res.get('font', 'nintendo')(text).createMesh();
        }

        function createModel(id) {
            return new (scene.resources.get('entity', id))().model;
        }

        const cameraNode = node.getElementsByTagName('camera')[0];
        const indicatorNode = node.getElementsByTagName('indicator')[0];
        const spacingNode = node.querySelector('spacing');

        stageSelect.setFrame(createModel('frame'));

        stageSelect.spacing.copy(parser.getVector2(spacingNode));
        stageSelect.cameraDistance = parser.getFloat(cameraNode, 'distance');
        stageSelect.indicatorInterval = parser.getFloat(indicatorNode, 'blink-interval');


        const stagesNode = node.getElementsByTagName('stage');
        stageSelect.rowLength = Math.ceil(Math.sqrt(stagesNode.length));
        for (let stageNode, i = 0; stageNode = stagesNode[i++];) {
            const id = parser.getAttr(stageNode, 'id')
            const name = parser.getAttr(stageNode, 'name');
            const text = parser.getAttr(stageNode, 'caption');
            const characterId = parser.getAttr(stageNode, 'character');
            stageSelect.addStage(createModel(id), createCaption(text), name,
                characterId && res.get('entity', characterId));
        }

        const initialIndex = parser.getInt(indicatorNode, 'initial-index') || 0;
        stageSelect.initialIndex = initialIndex;


        const starNodes = node.querySelectorAll(':scope > layout > stars > star');
        for (let node, i = 0; node = starNodes[i]; ++i) {
            const id = parser.getAttr(node, 'object');
            const count = parser.getInt(node, 'count');
            const depth = parser.getFloat(node, 'depth') || 0;
            for (let j = 0; j < count; ++j) {
                const model = createModel(id);
                model.position.z = -depth;
                stageSelect.addStar(model, depth);
            }
        }
    }
}