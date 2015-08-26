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
    var characterId = characterNode.attr('id');
    if (characterId === undefined) {
        throw new Error("<character> node missing id");
    }

    var parser = this;
    var loader = parser.loader;
    var game = loader.game;

    var modelNode = characterNode.find('> model');
    var modelSize = parser.getVector2(modelNode, 'w', 'h');

    var animator = new Engine.Animator.UV();
    var defaultTextureId = undefined;

    var textures = {};

    modelNode.find('> textures > texture').each(function() {
        var textureNode = $(this);
        var textureSize = parser.getVector2(textureNode, 'w', 'h');
        var texture = parser.getTexture(textureNode);

        var textureId = textureNode.attr('id');
        if (!textureId) {
            throw new Error("No id attribute on " + textureNode[0].outerHTML);
        }

        textures[textureId] = texture;

        if (defaultTextureId === undefined) {
            defaultTextureId = textureId;
        }

        var defaultAnimation = undefined;
        textureNode.find('> animations > animation').each(function() {
            var animationNode = $(this);
            var animation = parser.getUVAnimation(animationNode, textureSize, modelSize);
            animator.addAnimation(animationNode.attr('id'), animation, animationNode.attr('group'));
            if ('true' === animationNode.attr('default')) {
                animator.setAnimation(animation);
            }
        });
    });

    var collision = [];
    modelNode.find('> collision > rect').each(function() {
        collision.push(parser.getRect($(this)));
    });

    var traits = [];
    characterNode.find('> traits > trait').each(function() {
        traits.push(parser.getTrait($(this)));
    });


    var sourceName = characterNode.attr('source');
    if (sourceName) {
        var source = Game.objects.characters[sourceName];
    }
    else {
        var source = Game.objects.Character;
    }

    var object = loader.createObject(characterId, source, function() {
        this.geometry = new THREE.PlaneGeometry(modelSize.x, modelSize.y);
        this.material = new THREE.MeshBasicMaterial({
            side: THREE.DoubleSide,
            map: this.textures[defaultTextureId],
            transparent: true,
        });

        source.call(this);

        for (var i in traits) {
            loader.applyTrait(this, traits[i]);
        }

        var anim = animator.clone();
        anim.addGeometry(this.geometry);
        this.animators.push(anim);

        for (var i in collision) {
            var r = collision[i];
            this.addCollisionRect(r.w, r.h, r.x, r.y);
        }
    });

    object.id = characterId;
    object.prototype.textures = textures;

    this.callback(object);
}
