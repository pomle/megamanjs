const THREE = require('three');
const CanvasUtil = require('../../CanvasUtil');
const Path = require('../../CameraPath');
const Util = require('../../Util');

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
        const fnName = name.replace(/-/g, '');
        const object = Util.renameFunction(fnName, func);
        Util.extend(object, ext);
        return object;
    }
    getArray(nodes, attr)
    {
        const values = [];
        for (let node, i = 0; node = nodes[i++];) {
            values.push(node.getAttribute(attr));
        }
        return values;
    }
    getAttr(node, name)
    {
        const val = node.getAttribute(name);
        if (val === null || val.length === 0) {
            return null;
        } else {
            return val;
        }
    }
    getAudio(audioNode)
    {
        const url = this.resolveURL(audioNode, 'src');
        if (!url) {
            const id = this.getAttr(audioNode, 'id');
            const audio = this.loader.resourceManager.get('audio', id);
            return Promise.resolve(audio);
        }

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
        const z = 150;
        const path = new Path();
        /* y1 and y2 is swapped because they are converted to negative values and
           y2 should always be bigger than y1. */
        const windowNode = pathNode.getElementsByTagName('window')[0];
        path.window[0] = this.getPosition(windowNode, 'x1', 'y1');
        path.window[1] = this.getPosition(windowNode, 'x2', 'y2');

        const constraintNode = pathNode.getElementsByTagName('constraint')[0];
        path.constraint[0] = this.getPosition(constraintNode, 'x1', 'y1', 'z');
        path.constraint[1] = this.getPosition(constraintNode, 'x2', 'y2', 'z');
        path.constraint[0].z = z;
        path.constraint[1].z = z;

        return path;
    }
    getColor(node, attr = 'color')
    {
        const val = node.getAttribute(attr);
        if (val) {
            const [r, g, b] = val.split(',').map(v => parseFloat(v));
            return new THREE.Color(r || 1, g || 1, b || 1);
        }
        return null;
    }
    getColorHex(node, attr = 'color')
    {
        const val = node.getAttribute(attr);
        if (val && val[0] === '#') {
            const [r, g, b] = [
                parseInt(val.substr(1, 2), 16),
                parseInt(val.substr(3, 2), 16),
                parseInt(val.substr(5, 2), 16),
            ];
            return new THREE.Vector3(r, g, b);
        }
        return null;
    }
    getFloat(node, attr)
    {
        const value = node.getAttribute(attr);
        if (value) {
            return parseFloat(value);
        }
        return null;
    }
    getGeometry(node)
    {
        const type = node.getAttribute('type');
        let geo;
        if (type === 'plane') {
            geo = new THREE.PlaneGeometry(
                parseFloat(node.getAttribute('w')),
                parseFloat(node.getAttribute('h')),
                parseFloat(node.getAttribute('w-segments')) || 1,
                parseFloat(node.getAttribute('h-segments')) || 1);
        } else {
            throw new Error('Could not parse geometry type "' + type + '"');
        }

        const uvs = geo.faceVertexUvs[0];
        for (let i = 0, l = uvs.length; i !== l; ++i) {
            uvs[i] = this.DEFAULT_UV;
        }

        return geo;
    }
    getInt(node, attr)
    {
        const value = node.getAttribute(attr);
        if (value) {
            return parseInt(value, 10);
        }
        return null;
    }
    getRange(node, attr, total)
    {
        const input = node.getAttribute(attr || 'range');

        const values = [];
        let groups, group, ranges, range, mod, upper, lower, comp;

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

            let i = 0;
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
        const vec3 = this.getVector3.apply(this, arguments);
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

        function createReplace(colorIn, colorOut) {
            return function colorReplace(canvas) {
                return CanvasUtil.colorReplace(canvas,
                    colorIn, colorOut);
            }
        }

        this.loader.resourceLoader.loadImage(textureUrl).then(canvas => {
            texture.name = textureId;
            const effects = [];
            const effectsNode = textureNode.getElementsByTagName('effects')[0];
            if (effectsNode) {
                const effectNodes = effectsNode.getElementsByTagName('*');
                for (let effectNode, i = 0; effectNode = effectNodes[i++];) {
                    if (effectNode.tagName === 'color-replace') {
                        const colors = [
                            this.getColorHex(effectNode, 'in'),
                            this.getColorHex(effectNode, 'out'),
                        ];
                        effects.push(createReplace(colors[0], colors[1]));
                    }
                }
            }

            if (textureScale !== 1) {
                effects.push(function(canvas) {
                    return CanvasUtil.scale(canvas, textureScale);
                });
            }

            effects.forEach(effect => {
                canvas = effect(canvas);
            });
            texture.image = canvas;
            texture.needsUpdate = true;
        });

        return texture;
    }
    getVector2(node, attrX, attrY)
    {
        const x = this.getAttr(node, attrX || 'x');
        const y = this.getAttr(node, attrY || 'y');
        if (x === null || y === null) {
            return null;
        }
        return new THREE.Vector2(parseFloat(x),
                                 parseFloat(y));
    }
    getVector3(node, attrX, attrY, attrZ)
    {
        if (arguments.length === 2) {
            const aggr = this.getAttr(node, attrX).split(',');
            const vec = new THREE.Vector3();
            vec.x = aggr[0] ? parseFloat(aggr[0]) : undefined;
            vec.y = aggr[1] ? parseFloat(aggr[1]) : undefined;
            vec.z = aggr[2] ? parseFloat(aggr[2]) : undefined;
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
        const url = this.getAttr(node, attr || 'url');
        if (!url) {
            return false;
        }
        if (node.ownerDocument.baseURL === undefined) {
            return url;
        }
        if (url.indexOf('http') === 0) {
            return url;
        }
        const baseUrl = node.ownerDocument.baseURL
                             .split('/')
                             .slice(0, -1)
                             .join('/') + '/';
        return baseUrl + url;
    }
}

module.exports = Parser;
