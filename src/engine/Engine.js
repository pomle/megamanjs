var Engine = function(renderer)
{
    this.renderer = renderer;
    this.events = {
        'render': [],
        'simulate': [],
    };
    this.isRunning = false;
    this.isSimulating = true;
    this.simulationSpeed = 1;
    this.timeElapsedTotal = 0;
    this.timeMax = 1/60;
    this.timeStretch = 1;
    this.scene = undefined;
}

Engine.prototype.loop = function(timeElapsed)
{
    if (!this.isRunning || !this.scene) {
        return false;
    }

    if (timeElapsed) {
        var i = 0;
        timeElapsed /= 1000;
        if (this.timeLastEvent) {
            var timeDiff = timeElapsed - this.timeLastEvent;
            timeDiff *= this.timeStretch;

            /* Never let more time than 1/60th of a second pass per frame in game world. */
            timeDiff = Math.min(timeDiff, this.timeMax);
            this.timeElapsedTotal += timeDiff;

            if (this.isSimulating && this.simulationSpeed) {
                var simTimeDiff = timeDiff * this.simulationSpeed;
                this.scene.updateTime(simTimeDiff);
                this.scene.camera.updateTime(simTimeDiff);

                for (i in this.events.simulate) {
                    this.events.simulate[i].call();
                }
            }
        }
        this.render();
        for (i in this.events.render) {
            this.events.render[i].call();
        }
        this.timeLastEvent = timeElapsed;
    }

    requestAnimationFrame(this.loop.bind(this));
}

Engine.prototype.pause = function()
{
    this.isRunning = false;
}

Engine.prototype.render = function()
{
    this.renderer.render(this.scene.scene,
                         this.scene.camera.camera);
}

Engine.prototype.run = function()
{
    if (this.isRunning) {
        throw new Error('Already running');
    }
    this.isRunning = true;
    this.timeLastEvent = undefined;
    this.loop();
}


Engine.TextureManager = {
    'scale': 4,
    'cache': {},
}

Engine.Util = {
    asyncLoadXml: function(url, callback)
    {
        var baseUrl = url.split('/').slice(0, -1).join('/') + '/';
        xmlhttp = new XMLHttpRequest();
        xmlhttp.onreadystatechange = function()
        {
            if (this.readyState === 4) {
               callback($(jQuery.parseXML(this.responseText)), baseUrl);
            }
        };
        xmlhttp.overrideMimeType('text/xml');
        xmlhttp.open("GET", url, true);
        xmlhttp.send();
    },

    createSprite: function(location, w, h)
    {
        var texture = Engine.Util.getTexture('sprites/' + location);
        var geometry = new THREE.PlaneGeometry(w, h);
        var material = new THREE.MeshBasicMaterial({
            //color: 0xffffff,
            //wireframe: true,
            side: THREE.DoubleSide,
            map: texture,
            transparent: true,
        });
        var model = new THREE.Mesh(geometry, material);
        return model;
    },

    createTextSprite: function(string, align)
    {
        align = align || 0;

        var charSize = {
            w: 8,
            h: 8,
        }
        var scale = Engine.TextureManager.scale;

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
        var geometry = new THREE.PlaneGeometry(textureSize.w, textureSize.h);
        var material = new THREE.MeshBasicMaterial({
            //color: 0xffffff,
            //wireframe: true,
            side: THREE.DoubleSide,
            map: texture,
            transparent: true,
        });
        var model = new THREE.Mesh(geometry, material);

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

        return model;
    },

    createUVMap: function(x, y, w, h, totalW, totalH)
    {
        /* Shave of a tiny bit from the UVMaps to avoid neighbor pixel shine-thru. */
        xc = .1;
        yc = .1;

        x += xc;
        y += yc;
        w -= xc*2;
        h -= yc*2;

        var uvs = [
            new THREE.Vector2(x / totalW, (totalH - y) / totalH),
            new THREE.Vector2(x / totalW, (totalH - (y + h)) / totalH),
            new THREE.Vector2((x + w) / totalW, (totalH - (y + h)) / totalH),
            new THREE.Vector2((x + w) / totalW, (totalH - y) / totalH),
        ];
        var uvMap = [
            [uvs[0], uvs[1], uvs[3]],
            [uvs[1], uvs[2], uvs[3]]
        ];
        return uvMap;
    },

    getTexture: function(url)
    {
        /* Default to 4x the sprite size before loading to memory. */
        return Engine.Util.getScaledTexture(url, Engine.TextureManager.scale);
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

    string: {
        fill: function(x, n)
        {
            var s = '';
            for (;;) {
                if (n & 1) s += x;
                n >>= 1;
                if (n) x += x;
                else break;
            }
            return s;
        }
    }
}

Math.RAD = Math.PI/180;

Engine.assets = {};
