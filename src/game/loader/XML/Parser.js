'use strict';

Game.Loader.XML.Parser =
class Parser
{
    constructor(loader)
    {
        this.loader = loader;
        this.DEFAULT_UV = [
            new THREE.Vector2(),
            new THREE.Vector2(),
            new THREE.Vector2(),
        ];
    }
    createObject(name, ext, func)
    {
        var fnname = name.replace(/-/g, '');
        var object = Engine.Util.renameFunction(fnname, func);
        Engine.Util.extend(object, ext);
        return object;
    }
    getAttr(node, name)
    {
        var val = node.getAttribute(name);
        if (val === null || val.length === 0) {
            return null;
        } else {
            return val;
        }
    }
    getAudio(audioNode)
    {
        const url = this.resolveURL(audioNode, 'src');
        return this.loader.resourceLoader.loadAudio(url)
            .then(audio => {
                const loopNode = audioNode.getElementsByTagName('loop')[0];
                if (loopNode) {
                    audio.setLoop(this.getFloat(loopNode, 'start') || 0,
                                  this.getFloat(loopNode, 'end') || audio.getBuffer().duration);
                }
                return audio;
            });
    }
    getBool(node, attr)
    {
        return node.getAttribute(attr) === 'true';
    }
    getCameraPath(pathNode)
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
    getColor(node, attr)
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
    getFloat(node, attr)
    {
        var value = node.getAttribute(attr);
        if (value) {
            return parseFloat(value);
        }
        return null;
    }
    getGeometry(node)
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
    getInt(node, attr)
    {
        var value = node.getAttribute(attr);
        if (value) {
            return parseInt(value, 10);
        }
        return null;
    }
    getRange(node, attr, total)
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
    getRect(node, attrX, attrY, attrW, attrH)
    {
        return {
            'x': this.getFloat(node, attrX || 'x') || 0,
            'y': this.getFloat(node, attrY || 'y') || 0,
            'w': this.getFloat(node, attrW || 'w'),
            'h': this.getFloat(node, attrH || 'h'),
        }
    }
    getPosition(node, attrX, attrY, attrZ)
    {
        var vec3 = this.getVector3.apply(this, arguments);
        return vec3;
    }
    getTexture(textureNode)
    {
        if (textureNode.tagName !== 'texture') {
            throw new Error("Node not <texture>");
        }

        const textureScale = this.getFloat(textureNode, 'scale') || this.loader.textureScale;
        const textureUrl = this.resolveURL(textureNode, 'url');
        const textureId = textureNode.getAttribute('id');

        const texture = new THREE.Texture();
        texture.magFilter = THREE.LinearFilter;
        texture.minFilter = THREE.LinearMipMapLinearFilter;

        this.loader.resourceLoader.loadImage(textureUrl)
            .then(canvas => {
                texture.name = textureId;
                const effects = [];
                const effectsNode = textureNode.getElementsByTagName('effects')[0];
                if (effectsNode) {
                    const effectNodes = effectsNode.getElementsByTagName('*');
                    for (let effectNode, i = 0; effectNode = effectNodes[i++];) {
                        if (effectNode.tagName === 'color-replace') {
                            const colors = [
                                this.getColor(effectNode, 'in'),
                                this.getColor(effectNode, 'out'),
                            ];
                            effects.push(function() {
                                const colorIn = colors[0];
                                const colorOut = colors[1];
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

                for (const i in effects) {
                    canvas = effects[i](canvas);
                }
                texture.image = canvas;
                texture.needsUpdate = true;
            });

        return texture;
    }
    getVector2(node, attrX, attrY)
    {
        var x = this.getAttr(node, attrX || 'x');
        var y = this.getAttr(node, attrY || 'y');
        if (x === null || y === null) {
            return null;
        }
        return new THREE.Vector2(parseFloat(x),
                                 parseFloat(y));
    }
    getVector3(node, attrX, attrY, attrZ)
    {
        if (arguments.length == 2) {
            const aggr = this.getAttr(node, attrX).split(',');
            const vec = new THREE.Vector3();
            vec.x = aggr[0] ? parseFloat(aggr[0]) : undefined;
            vec.y = aggr[1] ? parseFloat(aggr[1]) : undefined;
            vec.z = aggr[2] ? parseFloat(aggr[2]) : undefined;
            return vec;
        } else {
            const x = this.getAttr(node, attrX || 'x');
            const y = this.getAttr(node, attrY || 'y');
            const z = this.getAttr(node, attrZ || 'z');
            if (x === null || y === null) {
                return null;
            }
            return new THREE.Vector3(parseFloat(x),
                                     parseFloat(y),
                                     parseFloat(z));
        }
    }
    resolveURL(node, attr)
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
}
