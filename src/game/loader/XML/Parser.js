Game.Loader.XML.Parser = function(loader)
{
    this.loader = loader;
}

Game.Loader.XML.Parser.prototype.DEFAULT_UV = [
    new THREE.Vector3(),
    new THREE.Vector3(),
    new THREE.Vector3(),
];

Game.Loader.XML.Parser.prototype.createObject = function(name, ext, func) {
    var fnname = name.replace(/-/g, '');
    var object = Engine.Util.renameFunction(fnname, func);
    Engine.Util.extend(object, ext);
    return object;
}

Game.Loader.XML.Parser.prototype.getBool = function(node, attr)
{
    return node.getAttribute(attr) === 'true';
}

Game.Loader.XML.Parser.prototype.getCameraPath = function(pathNode)
{
    var z = 150;
    var path = new Engine.Camera.Path();
    /* y1 and y2 is swapped because they are converted to negative values and
       y2 should always be bigger than y1. */
    var windowNode = pathNode.getElementsByTagName('window')[0];
    path.window[0] = this.getPosition(windowNode, 'x1', 'y1');
    path.window[1] = this.getPosition(windowNode, 'x2', 'y2');

    var constraintNode = pathNode.getElementsByTagName('constraint')[0];
    path.constraint[0] = this.getPosition(constraintNode, 'x1', 'y1', 'z');
    path.constraint[1] = this.getPosition(constraintNode, 'x2', 'y2', 'z');
    path.constraint[0].z = z;
    path.constraint[1].z = z;

    return path;
}

Game.Loader.XML.Parser.prototype.getColor = function(node, attr)
{
    var c = node.attr(attr);
    if (c.indexOf('#') === 0) {
        var r = c.substr(1,2);
        var g = c.substr(3,2);
        var b = c.substr(5,2);
        r = parseInt(r, 16);
        g = parseInt(g, 16);
        b = parseInt(b, 16);

        return new THREE.Vector4(r, g, b, 1);
    }
    return false;
}

Game.Loader.XML.Parser.prototype.getFloat = function(node, attr)
{
    var value = node.getAttribute(attr);
    if (value && isFinite(value)) {
        return parseFloat(value);
    }
    return false;
}


Game.Loader.XML.Parser.prototype.getFloatValues = function(node, def)
{
    var value = node.attr(attr);
    if (value && isFinite(value)) {
        return parseFloat(value);
    }
    return def;
}

Game.Loader.XML.Parser.prototype.getGeometry = function(node)
{
    var type = node.getAttribute('type');
    var geo;
    if (type === 'plane') {
        geo = new THREE.PlaneGeometry(
            parseFloat(node.getAttribute('w')),
            parseFloat(node.getAttribute('h')),
            parseFloat(node.getAttribute('w-segments')) || 1,
            parseFloat(node.getAttribute('h-segments')) || 1);
    } else {
        throw new Error('Could not parse geometry type "' + type + '"');
    }

    var uvs = geo.faceVertexUvs[0];
    for (var i = 0, l = uvs.length; i !== l; ++i) {
        uvs[i] = this.DEFAULT_UV;
    }

    return geo;
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

        if (lower < 1) {
            throw new RangeError("Lower range beyond 0");
        }
        if (upper > total) {
            throw new RangeError("Upper range beyond " + total);
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
    return {
        'x': parseFloat(node.getAttribute(attrX || 'x')),
        'y': parseFloat(node.getAttribute(attrY || 'y')),
        'w': parseFloat(node.getAttribute(attrW || 'w')),
        'h': parseFloat(node.getAttribute(attrH || 'h')),
    }
}

Game.Loader.XML.Parser.prototype.getPosition = function(node, attrX, attrY, attrZ)
{
    var vec3 = this.getVector3.apply(this, arguments);
    return vec3;
}

Game.Loader.XML.Parser.prototype.getTexture = function(textureNode)
{
    if (textureNode.tagName !== 'texture') {
        throw new Error("Node not <texture>");
    }

    var parser = this;
    var loader = parser.loader;

    var textureId = textureNode.getAttribute('id');
    var textureUrl = this.resolveURL(textureNode, 'url');

    var textureScale = this.getFloat(textureNode, 'scale', 4);
    var texture = new THREE.Texture();
    texture.name = textureId;
    texture.magFilter = THREE.LinearFilter;
    texture.minFilter = THREE.LinearMipMapLinearFilter;

    var effects = [];
    var effectsNode = textureNode.getElementsByTagName('effects')[0];
    if (effectsNode) {
        for (var effectNode, i = 0; effectNode = effectsNode[i++];) {
            if (effectNode.tagName === 'color-replace') {
                var colors = [
                    this.getColor(effectNode, 'in'),
                    this.getColor(effectNode, 'out'),
                ];
                effects.push(function colorReplace(canvas) {
                    return Engine.CanvasUtil.colorReplace(canvas,
                      colors[0], colors[1]);
                });
            }
        }
    }

    if (textureScale !== 1) {
        effects.push(function(canvas) {
            return Engine.CanvasUtil.scale(canvas, textureScale);
        });
    }

    var image = new Image();
    image.onload = function() {
        var canvas = Engine.CanvasUtil.clone(this);
        for (var i in effects) {
            canvas = effects[i](canvas);
        }
        texture.image = canvas;
        texture.needsUpdate = true;
    }
    image.src = textureUrl;

    return texture;
}

Game.Loader.XML.Parser.prototype.getVector2 = function(node, attrX, attrY)
{
    var x = node.getAttribute(attrX || 'x');
    var y = node.getAttribute(attrY || 'y');
    if (x === undefined || y === undefined) {
        return false;
    }
    return new THREE.Vector2(parseFloat(x),
                             parseFloat(y));
}

Game.Loader.XML.Parser.prototype.getVector3 = function(node, attrX, attrY, attrZ)
{
    var x = node.getAttribute(attrX || 'x');
    var y = node.getAttribute(attrY || 'y');
    var z = node.getAttribute(attrZ || 'z');
    if (x === undefined || y === undefined) {
        return false;
    }
    return new THREE.Vector3(parseFloat(x),
                             parseFloat(y),
                             parseFloat(z));
}

Game.Loader.XML.Parser.prototype.resolveURL = function(node, attr)
{
    var url = node.getAttribute(attr || 'url');
    if (node.ownerDocument.baseURL === undefined) {
        return url;
    }
    if (url.indexOf('http') === 0) {
        return url;
    }
    var baseUrl = node.ownerDocument.baseURL
                         .split('/')
                         .slice(0, -1)
                         .join('/') + '/';
    return baseUrl + url;
}
