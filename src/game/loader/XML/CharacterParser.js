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
    var defaultTexture = undefined;

    var textures = {};

    modelNode.find('> textures > texture').each(function() {
        var textureNode = $(this);
        var textureSize = parser.getVector2(textureNode, 'w', 'h');
        var texture = parser.getTexture(textureNode);

        var textureId = textureNode.attr('id');
        if (textureId) {
            textures[textureId] = texture;
        }

        if (defaultTexture === undefined) {
            defaultTexture = texture;
        }

        var defaultAnimation = undefined;
        textureNode.find('> animations > animation').each(function() {
            var animationNode = $(this);
            var animation = parser.getUVAnimation(animationNode, textureSize, modelSize);
            animator.addAnimation(animationNode.attr('id'), animation, animationNode.attr('group'));
            if (defaultAnimation === undefined) {
                defaultAnimation = animation;
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
            map: defaultTexture,
            transparent: true,
        });

        source.call(this);

        for (var i in traits) {
            var trait = traits[i];
            var appliedTrait = loader.applyTrait(this, trait);

            switch (appliedTrait.NAME) {
                case 'weapon':
                    if (trait.equip) {
                        if (!Game.objects.weapons[trait.equip]) {
                            throw new Error('Weapon ' + trait.equip + ' not found');
                        }
                        appliedTrait.equip(new Game.objects.weapons[trait.equip]());
                    }
                    break;
            }
        }

        var anim = animator.clone();
        anim.addGeometry(this.geometry);
        anim.update();
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