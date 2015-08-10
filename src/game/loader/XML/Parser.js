Game.Loader.XML.Parser = function(loader)
{
    this.loader = loader;
    this.callback = function() {};
    this.animations = {};
}

Game.Loader.XML.Parser.prototype.getAbsoluteUrl = function(node, attr)
{
    var base = node[0].ownerDocument.baseURL.split('/').slice(0, -1).join('/') + '/';
    var rel = node.attr(attr);
    return  base + rel;
}

Game.Loader.XML.Parser.prototype.getFloat = function(node, attr, def)
{
    var value = node.attr(attr);
    if (value && isFinite(value)) {
        return parseFloat(value);
    }
    return def;
}

Game.Loader.XML.Parser.prototype.getGeometry = function(node)
{
    var type = node.attr('type');
    switch (type) {
        case 'plane':
            return new THREE.PlaneGeometry(
                parseFloat(node.attr('w')),
                parseFloat(node.attr('h')),
                parseFloat(node.attr('w-segments')) || 1,
                parseFloat(node.attr('h-segments')) || 1);
    }
    throw new Error('Could not parse geometry type "' + type + '"');
}

Game.Loader.XML.Parser.prototype.getObject = function(objectNode)
{
    var parser = this;

    var objectId = objectNode.attr('id');
    var geometryNode = objectNode.find('> geometry');
    var geometry = parser.getGeometry(geometryNode);
    var size = parser.getVector2(geometryNode, 'w', 'h');
    var segs = parser.getVector2(geometryNode, 'w-segments', 'h-segments');

    var textures = [];
    var animators = [];

    objectNode.find('> tile').each(function() {
        var tileNode = $(this);
        var animationId = tileNode.attr('id');
        if (!parser.animations[animationId]) {
            throw new Error('Animation "' + animationId + '" not defined');
        }

        var animation = parser.animations[animationId].animation;
        var offset = parseFloat(tileNode.attr('offset')) || 0;

        tileNode.find('> face').each(function() {
            var faceNode = $(this);
            var animator = new Engine.Animator.UV();
            animator.indices = [];
            animator.setAnimation(animation);
            textures.push(parser.animations[animationId].texture);

            var range = {
                'x': parser.getRange(faceNode, 'x', segs.x),
                'y': parser.getRange(faceNode, 'y', segs.y),
            };

            var i, j, x, y, faceIndex;
            for (i in range.x) {
                x = range.x[i] - 1;
                for (j in range.y) {
                    y = range.y[j] - 1;
                    /* The face index is the first of the two triangles that make up a rectangular
                       face. The Animator.UV will set the UV map to the faceIndex and faceIndex+1.
                       Since we expect to paint two triangles at every index we need to 2x the index
                       count so that we skip two faces for every index jump. */
                    faceIndex = (x + (y * segs.x)) * 2;
                    animator.indices.push(faceIndex);
                }
            }
            animators.push(animator);
        });
    });

    var traits = [];
    objectNode.find('> traits > trait').each(function() {
        var traitNode = $(this);
        traits.push(parser.getTrait(traitNode));
    });

    var collision = [];
    objectNode.find('> collision > rect').each(function() {
        var rectNode = $(this);
        collision.push(parser.getRect(rectNode));
    });

    if (!textures[0]) {
        throw new Error("No texture index 0 for model " + objectId);
    }

    var material = new THREE.MeshBasicMaterial({
        map: textures[0],
        side: THREE.FrontSide,
    });

    var object = function()
    {
        this._objectId = objectId;

        this.geometry = geometry.clone();
        this.material = material;

        /* Run initial update of all UV maps. */
        for (var i in animators) {
            var animator = new Engine.Animator.UV();
            animator.copy(animators[i]);
            animator.addGeometry(this.geometry);
            animator.update();
            if (animator._currentAnimation.frames.length) {
                this.bind(this.EVENT_TIMESHIFT, animator.update.bind(animator));
            }
        }

        Engine.Object.call(this);

        for (var i in traits) {
            var trait = new traits[i].ref();
            for (var p in traits[i].prop) {
                var prop = traits[i].prop[p];
                if (prop !== undefined) {
                    trait[p] = prop;
                }
            }
            this[trait.NAME] = this.applyTrait(trait);
        }

        for (var i in collision) {
            var r = collision[i];
            this.addCollisionRect(r.w, r.h, r.x, r.y);
        }
    }

    Engine.Util.extend(object, Engine.Object);

    return object;
}

Game.Loader.XML.Parser.prototype.getRange = function(node, attr, total)
{
    var input = $(node).attr(attr || 'range');

    var values = [];
    var groups, group, ranges, range, mod, upper, lower, i;

    groups = input.split(',');

    while (group = groups.shift()) {

        mod = parseFloat(group.split('/')[1]) || 1;
        ranges = group.split('-');

        if (ranges.length == 2) {
            lower = parseFloat(ranges[0]);
            upper = parseFloat(ranges[1]);
        }
        else if (ranges[0] == '*') {
            lower = 1;
            upper = total;
        }
        else {
            lower = parseFloat(ranges[0]);
            upper = lower;
        }

        i = 0;
        while (lower <= upper) {
            if (i++ % mod === 0) {
                values.push(lower);
            }
            ++lower;
        }
    }

    return values;
}

Game.Loader.XML.Parser.prototype.getRect = function(node, attrX, attrY, attrW, attrH)
{
    var node = $(node);
    return {
        'x': parseFloat(node.attr(attrX || 'x')),
        'y': parseFloat(node.attr(attrY || 'y')),
        'w': parseFloat(node.attr(attrW || 'w')),
        'h': parseFloat(node.attr(attrH || 'h')),
    }
}

Game.Loader.XML.Parser.prototype.getPosition = function(node, attrX, attrY, attrZ)
{
    var node = $(node);
    var vec3 = this.getVector3.apply(this, arguments);
    /* Y gets inverted to avoid having to specify everything
       negatively in the XML. This is only true for getPosition
       explicitly and normal vector extraction gives raw value.
    */
    vec3.y = -vec3.y;
    return vec3;
}

Game.Loader.XML.Parser.prototype.getTexture = function(textureNode)
{
    var textureId = textureNode.attr('id');
    var textureUrl = this.getAbsoluteUrl(textureNode, 'url');
    if (!textureId) {
        textureId = textureUrl;
    }

    var resources = this.loader.game.resource;
    var texture = resources.get('texture', textureId);
    if (!texture) {
        var texture = resources.loadTexture(textureUrl);
        resources.addTexture(textureId, texture);
    }
    return texture;
}

Game.Loader.XML.Parser.prototype.getTrait = function(traitNode)
{
    var source = traitNode.attr('source');
    var ref = Game.traits[source] ? Game.traits[source] : Engine.traits[source];

    switch (ref.prototype.NAME) {
        case 'contactDamager':
            return {
                'ref': ref,
                'prop': {
                    'points': this.getFloat(traitNode, 'points'),
                }
            }
            break;

        case 'jump':
            return {
                'ref': ref,
                'prop': {
                    'duration': this.getFloat(traitNode, 'duration'),
                    'force': this.getFloat(traitNode, 'force'),
                }
            }
            break;

        case 'health':
            return {
                'ref': ref,
                'prop': {
                    'max': this.getFloat(traitNode, 'max'),
                }
            }
            break;

        case 'invincibility':
            return {
                'ref': ref,
                'prop': {
                    'duration': this.getFloat(traitNode, 'duration'),
                }
            }
            break;

        case 'physics':
            return {
                'ref': ref,
                'prop': {
                    'mass': this.getFloat(traitNode, 'mass'),
                }
            }
            break;

        case 'weapon':
            return {
                'ref': ref,
                'prop': {
                    'projectileEmitOffset': this.getVector2(traitNode.find('> projectile-emit-offset')),
                }
            }
            break;

        default:
            return {
                'ref': ref,
            }
            break;
    }
}

Game.Loader.XML.Parser.prototype.getVector2 = function(node, attrX, attrY)
{
    var node = $(node);
    return new THREE.Vector2(
        parseFloat(node.attr(attrX || 'x')) || undefined,
        parseFloat(node.attr(attrY || 'y')) || undefined);
}

Game.Loader.XML.Parser.prototype.getVector3 = function(node, attrX, attrY, attrZ)
{
    var node = $(node);
    var vec3 = new THREE.Vector3(
        parseFloat(node.attr(attrX || 'x')) || 0,
        parseFloat(node.attr(attrY || 'y')) || 0,
        parseFloat(node.attr(attrZ || 'z')) || 0);
    return vec3;
}

Game.Loader.XML.Parser.prototype.parseTexture = function(textureNode)
{
    var parser = this;
    var textureSize = parser.getVector2(textureNode, 'w', 'h');
    var texture = parser.getTexture(textureNode);

    textureNode.find('animation').each(function() {
        var animationNode = $(this);
        var animation = new Engine.Animator.Animation();
        animationNode.find('> frame').each(function() {
            var frameNode = $(this);
            var frameOffset = parser.getVector2(frameNode, 'x', 'y');
            var frameSize = parser.getVector2(frameNode, 'w', 'h');

            var uvMap = Engine.SpriteManager.createUVMap(frameOffset.x, frameOffset.y,
                                                         frameSize.x,   frameSize.y,
                                                         textureSize.x, textureSize.y);

            var duration = parseFloat(frameNode.attr('duration')) || undefined;
            animation.addFrame(uvMap, duration);
        });
        parser.animations[animationNode.attr('id')] = {
            'animation': animation,
            'texture': texture,
            'mounted': false,
        }
    });
}
