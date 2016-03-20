Game.Loader.XML.Parser.StageSelectParser = function(loader)
{
    Game.Loader.XML.Parser.call(this, loader);
}

Engine.Util.extend(Game.Loader.XML.Parser.StageSelectParser,
                   Game.Loader.XML.Parser);

Game.Loader.XML.Parser.StageSelectParser.prototype.parseStageSelect = function(sceneNode)
{
    var loader = this.loader;
    var parser = new Game.Loader.XML.Parser(loader);

    return new Promise(function(resolve) {
        if (!sceneNode.is('scene[type=stage-select]')) {
            throw new TypeError('Node not <scene type="stage-select">');
        }

        var scene = new Game.scenes.StageSelect(loader.game, new Engine.World());
        var textureNode = sceneNode.find('texture');
        var texture = parser.getTexture(textureNode);
        var textureSize = parser.getVector2(textureNode, 'w', 'h');

        var backgroundNode = sceneNode.children('background');
        scene.setBackgroundColor(backgroundNode.attr('color'));

        var cameraNode = sceneNode.children('camera');
        scene.cameraDistance = parseFloat(cameraNode.attr('distance')) || scene.cameraDistance;

        var indicatorNode = sceneNode.children('indicator');
        scene.setIndicator(Engine.SpriteManager.createTile(
            texture,
            parseFloat(indicatorNode.attr('w')), parseFloat(indicatorNode.attr('h')),
            parseFloat(indicatorNode.attr('x')), parseFloat(indicatorNode.attr('y')),
            textureSize.x, textureSize.y));

        scene.indicatorInterval = parseFloat(indicatorNode.attr('blink-interval')) || scene.indicatorInterval;

        var frameNode = sceneNode.children('frame');
        scene.setFrame(Engine.SpriteManager.createTile(
            texture,
            parseFloat(frameNode.attr('w')), parseFloat(frameNode.attr('h')),
            parseFloat(frameNode.attr('x')), parseFloat(frameNode.attr('y')),
            textureSize.x, textureSize.y));

        var stagesNode = sceneNode.find('> stage');
        scene.rowLength = Math.ceil(Math.sqrt(stagesNode.length));
        stagesNode.each(function() {
            var stageNode = $(this);
            var avatar = Engine.SpriteManager.createTile(
                texture,
                parseFloat(stageNode.attr('w')), parseFloat(stageNode.attr('h')),
                parseFloat(stageNode.attr('x')), parseFloat(stageNode.attr('y')),
                textureSize.x, textureSize.y);
            var index = parseFloat(stageNode.attr('index'));
            var name = stageNode.attr('name');
            var caption = stageNode.attr('caption');
            scene.addStage(avatar, caption, name);
        });

        scene.equalize(parseFloat(indicatorNode.attr('initial-index')));

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
