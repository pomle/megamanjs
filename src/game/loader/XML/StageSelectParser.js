'use strict';

Game.Loader.XML.StageSelectParser =
class StageSelectParser
extends Game.Loader.XML.SceneParser
{
    constructor(loader, node)
    {
        if (node.tagName !== 'scene' || node.getAttribute('type') !== 'stage-select') {
            throw new TypeError('Node not <scene type="stage-select">');
        }

        super(loader, new Game.scenes.StageSelect);
        this._node = node;
        this._objects = null;
    }
    _parse()
    {
        this._parseAudio();
        this._parseEvents();
        this._setupBehavior();
        return this._parseObjects().then(objects => {
            this._objects = {};
            Object.keys(objects).forEach(id => {
                this._objects[id] = objects[id].constructor;
            });
            return this._parseLayout();
        }).then(() => {

        }).then(() => {
            return this.loader.resourceLoader.complete();
        }).then(() => {
            return this._scene;
        });
    }
    _parseLayout()
    {
        const sceneNode = this._node;
        const scene = this._scene;
        const objects = this._objects;

        const backgroundNode = sceneNode.getElementsByTagName('background')[0];
        const cameraNode = sceneNode.getElementsByTagName('camera')[0];
        const indicatorNode = sceneNode.getElementsByTagName('indicator')[0];
        const spacingNode = sceneNode.querySelector('spacing');

        scene.setBackgroundColor(this.getAttr(backgroundNode, 'color'));
        scene.setIndicator(new objects['indicator']().model);
        scene.setFrame(new objects['frame']().model);

        if (spacingNode) {
            scene.spacing.copy(this.getVector2(spacingNode));
        }
        if (cameraNode) {
            scene.cameraDistance = this.getFloat(cameraNode, 'distance');
        }
        if (indicatorNode) {
            console.log(indicatorNode);
            scene.indicatorInterval = this.getFloat(indicatorNode, 'blink-interval');
        }

        const stagesNode = sceneNode.getElementsByTagName('stage');
        scene.rowLength = Math.ceil(Math.sqrt(stagesNode.length));
        for (let stageNode, i = 0; stageNode = stagesNode[i++];) {
            const id = this.getAttr(stageNode, 'id')
            const name = this.getAttr(stageNode, 'name');
            const text = this.getAttr(stageNode, 'caption');
            const caption = this._createCaption(text);
            const avatar = new objects[id]().model;
            scene.addStage(avatar, caption, name);
        }

        const initialIndex = this.getInt(indicatorNode, 'initial-index');
        scene.events.bind(scene.EVENT_CREATE, () => {
            scene.equalize(initialIndex);
        });

        return Promise.resolve();
    }
    _parseObjects()
    {
        const node = this._node.querySelector(':scope > objects');
        const parser = new Game.Loader.XML.ObjectParser(this.loader, node);
        return parser.getObjects();
    }
    _setupBehavior()
    {
        const stageSelectScene = this._scene;
        this._scene.events.bind(this._scene.EVENT_STAGE_ENTER, (stage, index) => {
            try {
                this.loader.startScene(stage.name).then(scene => {
                    scene.events.bind(scene.EVENT_END, () => {
                        this.loader.game.setScene(stageSelectScene);
                    });
                });
            } catch (err) {
                this.loader.game.setScene(stageSelectScene);
            }
        });
    }
    _createCaption(text)
    {
        text = text.split(" ");
        text[1] = Engine.Util.string.fill(" ", 6 - text[1].length) + text[1];
        text = text.join("\n");
        return this.loader.resourceManager.get('font', 'nintendo')(text).createMesh();
    }
}
