Engine.TextureManager = {
    scale: 4,
    cache: {},
    createText: function(string, align)
    {
        align = align || 0;

        var cacheKey = 'text://' + string + '_' + align;
        if (!Engine.TextureManager.cache[cacheKey]) {
            var charSize = new THREE.Vector2(8, 8);
            var scale = this.scale;

            var charMap = " !\"#$%&'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~";

            var lines = string.split("\n");
            var lengths = [];
            for (var i in lines) {
                lengths.push(lines[i].length);
            }
            var totalLen = Math.max.apply(Math, lengths);
            var textSize = new THREE.Vector2(charSize.x * totalLen, charSize.y * lines.length);
            var textureSize = new THREE.Vector2(Engine.Math.nextPowerOf(textSize.x), Engine.Math.nextPowerOf(textSize.y));

            var canvas = document.createElement("canvas");
            var texture = new THREE.Texture(canvas);

            var image = new Image();
            image.onload = function() {
                var cursorPos;
                var charMapMod = this.width / charSize.x;
                canvas.width = textureSize.x * scale;
                canvas.height = textureSize.y * scale;
                var context = canvas.getContext("2d");
                context.imageSmoothingEnabled = false;
                for (var i in lines) {
                    var chars = lines[i].split('');
                    switch (align) {
                        case 0:
                            cursorPos = 0;
                            break;
                    }
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
                        context.drawImage(this,
                                          co.sx, co.sy, co.sw, co.sh,
                                          co.dx, co.dy, co.dw, co.dh);
                    }
                }
                texture.needsUpdate = true;
            }
            image.src = 'sprites/font.png';
            Engine.TextureManager.cache[cacheKey] = {
                'texture': texture,
                'textSize': textSize,
                'textureSize': textureSize,
            };
        }
        return Engine.TextureManager.cache[cacheKey];
    },
}
