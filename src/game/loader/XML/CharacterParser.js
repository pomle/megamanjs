Game.Loader.XML.Parser.CharacterParser = function(loader)
{
    Game.Loader.XML.Parser.call(this, loader);
}

Engine.Util.extend(Game.Loader.XML.Parser.CharacterParser, Game.Loader.XML.Parser);

Game.Loader.XML.Parser.CharacterParser.prototype.parse = function(characterNode)
{
    if (!characterNode.is('character')) {
        throw new TypeError("Not <character> node");
    }
    var parser = this;
    var loader = parser.loader;
    var game = loader.game;

    var modelNode = characterNode.find('> model');
    var modelSize = parser.getVector2(modelNode, 'w', 'h');

    var animator = new Engine.Animator.UV();
    var defaultTextureId = undefined;

    modelNode.find('> textures > texture').each(function() {
        var textureNode = $(this);
        var textureSize = parser.getVector2(textureNode, 'w', 'h');
        var texture = parser.getTexture(textureNode);

        var textureId = textureNode.attr('id');
        if (!textureId) {
            throw new Error("No id attribute on " + textureNode[0].outerHTML);
        }

        if (defaultTextureId === undefined) {
            defaultTextureId = textureId;
        }

        var defaultAnimation = undefined;
        textureNode.find('> animations > animation').each(function() {
            var animationNode = $(this);
            var animation = animator.createAnimation(animationNode.attr('id'), animationNode.attr('group'));
            animationNode.find('> frame').each(function() {
                var frameNode = $(this);
                var frameOffset = parser.getVector2(frameNode);

                var uvMap = Engine.SpriteManager.createUVMap(frameOffset.x, frameOffset.y,
                                                             modelSize.x, modelSize.y,
                                                             textureSize.x, textureSize.y);
                var duration = parseFloat(frameNode.attr('duration')) || undefined;
                animation.addFrame(uvMap, duration);
            });
            if ('true' === animationNode.attr('default')) {
                animator.setAnimation(animation);
            }
        });
    });

    var collision = [];
    modelNode.find('> collision > rect').each(function() {
        var rectNode = $(this);
        collision.push(parser.getRect(rectNode));
    });

    loader = undefined;


    var sourceName = characterNode.attr('source');
    var source = Game.objects.characters[sourceName];

    var constructor = function()
    {
        this._parentName = sourceName;
        this.geometry = new THREE.PlaneGeometry(modelSize.x, modelSize.y);
        this.material = new THREE.MeshBasicMaterial({
            side: THREE.DoubleSide,
            map: game.resource.get('texture', defaultTextureId),
            transparent: true,
        });

        source.call(this);

        this.animator = new Engine.Animator.UV();
        this.animator.copy(animator);
        this.animator.addGeometry(this.model.geometry);


        for (var i in collision) {
            var r = collision[i];
            this.addCollisionRect(r.w, r.h, r.x, r.y);
        }
    }

    Engine.Util.extend(constructor, source);

    this.callback(constructor);
}
