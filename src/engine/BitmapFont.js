'use strict';

Engine.BitmapFont =
class BitmapFont
{
    constructor(map, size, image)
    {
        this.charMap = map;
        this.charSize = new THREE.Vector2(size.x, size.y);
        this.image = image;
        this.scale = 1;
    }

    createText(string)
    {
        const charSize = this.charSize;
        const charMap = this.charMap;

        const lines = string.split("\n");
        const lengths = [];
        for (let i in lines) {
            lengths.push(lines[i].length);
        }
        const totalLen = Math.max.apply(Math, lengths);

        const textSize = new THREE.Vector2(charSize.x * totalLen,
                                           charSize.y * lines.length);

        const textureSize = new THREE.Vector2(Engine.Math.nextPowerOf(textSize.x),
                                              Engine.Math.nextPowerOf(textSize.y));

        const canvas = document.createElement("canvas");

        const scale = this.scale;
        const charMapMod = this.image.width / charSize.x;
        canvas.width = textureSize.x * scale;
        canvas.height = textureSize.y * scale;
        const context = canvas.getContext("2d");
        context.imageSmoothingEnabled = false;

        for (let i in lines) {
            const chars = lines[i].split('');
            for (let j in chars) {
                const charPos = charMap.indexOf(chars[j]);
                const co = {
                    dx: charSize.x * j * scale,
                    dy: charSize.y * i * scale,
                    dw: charSize.x * scale,
                    dh: charSize.y * scale,
                    sx: (charPos % charMapMod) * charSize.x,
                    sy: Math.floor(charPos / charMapMod) * charSize.y,
                    sw: charSize.x,
                    sh: charSize.y,
                }
                context.drawImage(this.image,
                                  co.sx, co.sy, co.sw, co.sh,
                                  co.dx, co.dy, co.dw, co.dh);
            }
        }
        const texture = new THREE.Texture(canvas);
        texture.magFilter = THREE.LinearFilter;
        texture.minFilter = THREE.LinearMipMapLinearFilter;
        texture.needsUpdate = true;
        return new Engine.BitmapFont.Text(texture, textSize, textureSize);
    }
}

Engine.BitmapFont.Text = class BitMapFontText
{
    constructor(texture, size, textureSize)
    {
        this.texture = texture;
        this.size = size;
        this.uvMap = new Engine.UVCoords({x: 0, y: 0}, size, textureSize);
    }

    createMesh()
    {
        const geometry = new THREE.PlaneGeometry(this.size.x, this.size.y);
        geometry.faceVertexUvs[0] = this.uvMap;
        const material = new THREE.MeshBasicMaterial({
            side: THREE.FrontSide,
            map: this.texture,
            transparent: true,
        });
        return new THREE.Mesh(geometry, material);
    }
}
