Engine.TextureManager = {
    scale: 4,
    cache: {},

    createText: function(string, align)
    {
        align = align || 0;

        var charSize = {
            w: 8,
            h: 8,
        }
        var scale = this.scale;

        var charMap = " !\"#$%&'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~";

        var lines = string.split("\n");
        var lengths = [];
        for (var i in lines) {
            lengths.push(lines[i].length);
        }
        var totalLen = Math.max.apply(Math, lengths);
        var textureSize = {
            w: charSize.w * totalLen,
            h: charSize.h * lines.length,
        }

        var canvas = document.createElement("canvas");
        var texture = new THREE.Texture(canvas);

        var image = new Image();
        image.onload = function() {
            var cursorPos;
            var charMapMod = this.width / charSize.w;
            canvas.width = textureSize.w * scale;
            canvas.height = textureSize.h * scale;
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
                        dx: charSize.w * j * scale,
                        dy: charSize.h * i * scale,
                        dw: charSize.w * scale,
                        dh: charSize.h * scale,
                        sx: (charPos % charMapMod) * charSize.w,
                        sy: Math.floor(charPos / charMapMod) * charSize.h,
                        sw: charSize.w,
                        sh: charSize.h,
                    }
                    context.drawImage(this,
                                      co.sx, co.sy, co.sw, co.sh,
                                      co.dx, co.dy, co.dw, co.dh);
                }
            }
            texture.needsUpdate = true;
        }
        image.src = 'sprites/font.png';

        return {
            'texture': texture,
            'w': textureSize.w,
            'h': textureSize.h,
        };
    },

    getTexture: function(url)
    {
        return Engine.TextureManager.getScaledTexture(url, this.scale);
    },

    getScaledTexture: function(url, scale)
    {
        var cacheKey = url + '_' + scale;
        if (!Engine.TextureManager.cache[cacheKey]) {
            var canvas = document.createElement("canvas");
            var texture = new THREE.Texture(canvas);
            texture.sourceFile = cacheKey;
            var image = new Image();
            image.onload = function() {
                var x = this.width * scale;
                var y = this.height * scale;
                canvas.width = x;
                canvas.height = y;
                var context = canvas.getContext("2d");
                context.imageSmoothingEnabled = false;
                context.drawImage(this, 0, 0, x, y);
                texture.needsUpdate = true;
                texture.magFilter = THREE.NearestFilter;
                texture.minFilter = THREE.LinearMipMapLinearFilter;
            }
            image.src = url;
            Engine.TextureManager.cache[cacheKey] = texture;
        }
        return Engine.TextureManager.cache[cacheKey];
    },
}
