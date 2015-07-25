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
        var texture = Engine.TextureManager.getTexture('sprites/' + location);
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
        var texture = Engine.TextureManager.createText(string, align);
        var geometry = new THREE.PlaneGeometry(texture.w, texture.h);
        var material = new THREE.MeshBasicMaterial({
            side: THREE.FrontSide,
            map: texture.texture,
            transparent: true,
        });
        return new THREE.Mesh(geometry, material);
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
