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

        var objectsNode = sceneNode.getElementsByTagName('objects')[0];
        var objectParser = new Game.Loader.XML.Parser.ObjectParser();
        var objects = objectParser.parse(objectsNode);

        var backgroundNode = sceneNode.getElementsByTagName('background')[0];
        scene.setBackgroundColor(backgroundNode.getAttribute('color'));

        var cameraNode = sceneNode.getElementsByTagName('camera')[0];
        scene.cameraDistance = parseFloat(cameraNode.getAttribute('distance')) || scene.cameraDistance;

        var indicatorNode = sceneNode.getElementsByTagName('indicator')[0];
        scene.setIndicator(new objects['indicator']().model);
        scene.indicatorInterval = parseFloat(indicatorNode.getAttribute('blink-interval')) || scene.indicatorInterval;

        scene.setFrame(new objects['frame']().model);

        var stagesNode = sceneNode.getElementsByTagName('stage');
        scene.rowLength = Math.ceil(Math.sqrt(stagesNode.length));
        for (var stageNode, i = 0; stageNode = stagesNode[i++];) {
            var id = stageNode.getAttribute('id');
            var avatar = new objects[id]().model;
            var name = stageNode.getAttribute('name');
            var caption = this.createCaption(stageNode.getAttribute('caption'));
            scene.addStage(avatar, caption, name);
        }

        scene.equalize(parseFloat(indicatorNode.getAttribute('initial-index')));

        var stageSelect = scene;
        var loader = this.loader;
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

Game.Loader.XML.Parser.StageSelectParser.prototype.createCaption = function(text) {
    text = text.split(" ");
    text[1] = Engine.Util.string.fill(" ", 6 - text[1].length) + text[1];
    text = text.join("\n");
    return this.loader.resource.items.font['nintendo'](text).createMesh();
}
