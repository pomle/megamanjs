const THREE = require('three');
const { Vector2 } = THREE;
const { nextPowerOf } = require('./Math');
const UVCoords = require('./UVCoords');

class BitmapFont
{
    constructor(map, size, image)
    {
        this.charMap = map;
        this.charSize = new Vector2(size.x, size.y);
        this.image = image;
        this.scale = 1;
    }

    createText(string)
    {
        const charSize = this.charSize;

        const lines = string.split("\n");
        const totalLen = lines.reduce((max, line) => Math.max(max, line.length), 0);

        const textSize = new Vector2(charSize.x * totalLen,
                                           charSize.y * lines.length);

        const textureSize = new Vector2(nextPowerOf(textSize.x),
                                        nextPowerOf(textSize.y));

        const canvas = document.createElement("canvas");

        const scale = this.scale;
        const charMapMod = this.image.width / charSize.x;
        canvas.width = textureSize.x * scale;
        canvas.height = textureSize.y * scale;
        const context = canvas.getContext("2d");
        context.imageSmoothingEnabled = false;

        lines.forEach((chars, line)  => {
            for (let index = 0, char; char = chars[index]; index++) {
                const pos = this.charMap.indexOf(char);
                if (pos === -1) {
                    throw new Error(`Char "${char}" not in map ${this.charMap}`);
                }
                const co = {
                    dx: charSize.x * index * scale,
                    dy: charSize.y * line * scale,
                    dw: charSize.x * scale,
                    dh: charSize.y * scale,
                    sx: (pos % charMapMod) * charSize.x,
                    sy: Math.floor(pos / charMapMod) * charSize.y,
                    sw: charSize.x,
                    sh: charSize.y,
                }
                context.drawImage(this.image,
                                  co.sx, co.sy, co.sw, co.sh,
                                  co.dx, co.dy, co.dw, co.dh);
            }
        });
        const texture = new THREE.Texture(canvas);
        texture.magFilter = THREE.LinearFilter;
        texture.minFilter = THREE.LinearMipMapLinearFilter;
        texture.needsUpdate = true;
        return new Text(texture, textSize, textureSize);
    }
}

class Text
{
    constructor(texture, size, textureSize)
    {
        this._texture = texture;
        this._size = size;
        this._uvMap = new UVCoords({x: 0, y: 0}, size, textureSize);
    }
    getGeometry()
    {
        const geometry = new THREE.PlaneGeometry(this._size.x, this._size.y);
        geometry.faceVertexUvs[0] = this._uvMap;
        return geometry;
    }
    getMaterial()
    {
        const material = new THREE.MeshBasicMaterial({
            side: THREE.FrontSide,
            map: this.getTexture(),
            transparent: true,
        });
        return material;
    }
    getTexture()
    {
        return this._texture;
    }
    createMesh()
    {
        const geometry = this.getGeometry();
        const material = this.getMaterial();
        return new THREE.Mesh(geometry, material);
    }
}

BitmapFont.Text = Text;

module.exports = BitmapFont;
