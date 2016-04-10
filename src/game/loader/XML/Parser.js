Game.Loader.XML.Parser = function(loader)
{
    this.loader = loader;
}

Game.Loader.XML.Parser.prototype.DEFAULT_UV = [
    new THREE.Vector2(),
    new THREE.Vector2(),
    new THREE.Vector2(),
];

Game.Loader.XML.Parser.prototype.createObject = function(name, ext, func) {
    var fnname = name.replace(/-/g, '');
    var object = Engine.Util.renameFunction(fnname, func);
    Engine.Util.extend(object, ext);
    return object;
}

Game.Loader.XML.Parser.prototype.getAttr = function(node, name) {
    var val = node.getAttribute(name);
    if (val === null || val.length === 0) {
        return null;
    } else {
        return val;
    }
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
    var c = node.getAttribute(attr);
    if (c && c[0] === '#') {
        var r = c.substr(1, 2);
        var g = c.substr(3, 2);
        var b = c.substr(5, 2);
        r = parseInt(r, 16);
        g = parseInt(g, 16);
        b = parseInt(b, 16);
        return new THREE.Vector4(r, g, b, 1);
    }
    return null;
}

Game.Loader.XML.Parser.prototype.getFloat = function(node, attr)
{
    var value = node.getAttribute(attr);
    if (value) {
        return parseFloat(value);
    }
    return null;
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
    var input = node.getAttribute(attr || 'range');

    var values = [];
    var groups, group, ranges, range, mod, upper, lower, comp;

    groups = input.split(',');

    while (group = groups.shift()) {
        comp = group.split('/');
        mod = comp[1] ? parseInt(comp[1], 10) : 1;
        ranges = comp[0].split('-');

        if (ranges.length === 2) {
            lower = parseInt(ranges[0], 10);
            upper = parseInt(ranges[1], 10);
        }
        else if (ranges[0] === '*') {
            lower = 1;
            upper = total;
        }
        else {
            lower = parseInt(ranges[0], 10);
            upper = lower;
        }

        if (lower > upper) {
            throw new RangeError("Lower range greater then upper");
        }
        if (upper > total) {
            throw new RangeError("Upper range beyond " + total);
        }

        var i = 0;
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
        'x': this.getFloat(node, attrX || 'x'),
        'y': this.getFloat(node, attrY || 'y'),
        'w': this.getFloat(node, attrW || 'w'),
        'h': this.getFloat(node, attrH || 'h'),
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

    var textureScale = this.getFloat(textureNode, 'scale') || 4;
    var texture = new THREE.Texture();
    texture.name = textureId;
    texture.magFilter = THREE.LinearFilter;
    texture.minFilter = THREE.LinearMipMapLinearFilter;

    var effects = [];
    var effectsNode = textureNode.getElementsByTagName('effects')[0];
    if (effectsNode) {
        var effectNodes = effectsNode.getElementsByTagName('*');
        for (var effectNode, i = 0; effectNode = effectNodes[i++];) {
            if (effectNode.tagName === 'color-replace') {
                var colors = [
                    this.getColor(effectNode, 'in'),
                    this.getColor(effectNode, 'out'),
                ];
                effects.push(function() {
                    var colorIn = colors[0];
                    var colorOut = colors[1];
                    return function colorReplace(canvas) {
                        return Engine.CanvasUtil.colorReplace(canvas,
                            colorIn, colorOut);
                    }
                }());
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
    var x = this.getAttr(node, attrX || 'x');
    var y = this.getAttr(node, attrY || 'y');
    if (x === null || y === null) {
        return null;
    }
    return new THREE.Vector2(parseFloat(x),
                             parseFloat(y));
}

Game.Loader.XML.Parser.prototype.getVector3 = function(node, attrX, attrY, attrZ)
{
    var x = this.getAttr(node, attrX || 'x');
    var y = this.getAttr(node, attrY || 'y');
    var z = this.getAttr(node, attrZ || 'z');
    if (x === null || y === null) {
        return null;
    }
    return new THREE.Vector3(parseFloat(x),
                             parseFloat(y),
                             parseFloat(z));
}

Game.Loader.XML.Parser.prototype.resolveURL = function(node, attr)
{
    var url = this.getAttr(node, attr || 'url');
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
