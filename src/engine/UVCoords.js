Engine.UVCoords = function(offset, size, txSize)
{
    Array.call(this);

    var x = offset.x;
    var y = offset.y;
    var w = size.x;
    var h = size.y;
    var totalW = txSize.x;
    var totalH = txSize.y;

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
