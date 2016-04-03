'use strict';

Game.Loader.XML.Parser.StageSelectParser = function(loader)
{
    Game.Loader.XML.Parser.call(this, loader);
}

Engine.Util.extend(Game.Loader.XML.Parser.StageSelectParser,
                   Game.Loader.XML.Parser);

Game.Loader.XML.Parser.StageSelectParser.prototype.parseStageSelect = function(sceneNode)
{
    if (sceneNode.tagName !== 'scene' || sceneNode.getAttribute('type') !== 'stage-select') {
        throw new TypeError('Node not <scene type="stage-select">');
    }

    return new Promise((resolve) => {
        var scene = new Game.scenes.StageSelect(this.loader.game, new Engine.World());
        var textureNode = sceneNode.getElementsByTagName('texture')[0];
        var texture = this.getTexture(textureNode);
        var textureSize = this.getVector2(textureNode, 'w', 'h');

        var backgroundNode = sceneNode.getElementsByTagName('background')[0];
        console.log(backgroundNode);
        scene.setBackgroundColor(backgroundNode.getAttribute('color'));

        var cameraNode = sceneNode.getElementsByTagName('camera')[0];
        scene.cameraDistance = parseFloat(cameraNode.getAttribute('distance')) || scene.cameraDistance;

        var indicatorNode = sceneNode.getElementsByTagName('indicator')[0];
        scene.setIndicator(Engine.SpriteManager.createTile(
            texture,
            parseFloat(indicatorNode.getAttribute('w')), parseFloat(indicatorNode.getAttribute('h')),
            parseFloat(indicatorNode.getAttribute('x')), parseFloat(indicatorNode.getAttribute('y')),
            textureSize.x, textureSize.y));

        scene.indicatorInterval = parseFloat(indicatorNode.getAttribute('blink-interval')) || scene.indicatorInterval;

        var frameNode = sceneNode.getElementsByTagName('frame')[0];
        scene.setFrame(Engine.SpriteManager.createTile(
            texture,
            parseFloat(frameNode.getAttribute('w')), parseFloat(frameNode.getAttribute('h')),
            parseFloat(frameNode.getAttribute('x')), parseFloat(frameNode.getAttribute('y')),
            textureSize.x, textureSize.y));

        var stagesNode = sceneNode.getElementsByTagName('stage');
        scene.rowLength = Math.ceil(Math.sqrt(stagesNode.length));
        for (var stageNode, i = 0; stageNode = stagesNode[i++];) {
            var avatar = Engine.SpriteManager.createTile(
                texture,
                parseFloat(stageNode.getAttribute('w')), parseFloat(stageNode.getAttribute('h')),
                parseFloat(stageNode.getAttribute('x')), parseFloat(stageNode.getAttribute('y')),
                textureSize.x, textureSize.y);
            var index = parseFloat(stageNode.getAttribute('index'));
            var name = stageNode.getAttribute('name');
            var caption = stageNode.getAttribute('caption');
            scene.addStage(avatar, caption, name);
        }

        scene.equalize(parseFloat(indicatorNode.getAttribute('initial-index')));

        var stageSelect = scene;
        scene.events.bind(scene.EVENT_STAGE_SELECTED, function(stage, index) {
            loader.startScene(stage.name).then(function(scene) {
                scene.events.bind(scene.EVENT_END, function() {
                    loader.game.setScene(stageSelect);
                });
            });
        });

        resolve(scene);
    });
}
