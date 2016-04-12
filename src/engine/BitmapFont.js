Engine.BitmapFont = function(map, size, image) {
    this.charMap = map;
    this.charSize = new THREE.Vector2(size.x, size.y);
    this.image = image;
    this.scale = 1;
}

Engine.BitmapFont.prototype.createText = function(string) {
    var charSize = this.charSize;
    var charMap = this.charMap;

    var lines = string.split("\n");
    var lengths = [];
    for (var i in lines) {
        lengths.push(lines[i].length);
    }
    var totalLen = Math.max.apply(Math, lengths);

    var textSize = new THREE.Vector2(charSize.x * totalLen,
                                     charSize.y * lines.length);

    var textureSize = new THREE.Vector2(Engine.Math.nextPowerOf(textSize.x),
                                        Engine.Math.nextPowerOf(textSize.y));

    var canvas = document.createElement("canvas");

    var scale = this.scale;
    var charMapMod = this.image.width / charSize.x;
    canvas.width = textureSize.x * scale;
    canvas.height = textureSize.y * scale;
    var context = canvas.getContext("2d");
    context.imageSmoothingEnabled = false;

    for (var i in lines) {
        var chars = lines[i].split('');
        for (var j in chars) {
            var charPos = charMap.indexOf(chars[j]);
            var co = {
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
    var texture = new THREE.Texture(canvas);
    texture.needsUpdate = true;
    return new Engine.BitmapFont.Text(texture, textSize, textureSize);
}

Engine.BitmapFont.Text = function(texture, size, textureSize) {
    this.texture = texture;
    this.size = size;
    this.uvMap = new Engine.UVCoords({x: 0, y: 0}, size, textureSize);
}

Engine.BitmapFont.Text.prototype.createMesh = function() {
    var geometry = new THREE.PlaneGeometry(this.size.x, this.size.y);
    geometry.faceVertexUvs[0] = this.uvMap;
    var material = new THREE.MeshBasicMaterial({
        side: THREE.FrontSide,
        map: this.texture,
        transparent: true,
    });
    return new THREE.Mesh(geometry, material);
}


