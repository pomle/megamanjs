Engine.UVCoords = function(x, y, w, h, totalW, totalH)
{
    Array.call(this);

    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.totalW = totalW;
    this.totalH = totalH;

    var uvs = [
        new THREE.Vector2(x / totalW, (totalH - y) / totalH),
        new THREE.Vector2(x / totalW, (totalH - (y + h)) / totalH),
        new THREE.Vector2((x + w) / totalW, (totalH - (y + h)) / totalH),
        new THREE.Vector2((x + w) / totalW, (totalH - y) / totalH),
    ];

    this.push([uvs[0], uvs[1], uvs[3]],
              [uvs[1], uvs[2], uvs[3]]);
}

Engine.Util.extend(Engine.UVCoords, Array);
