var TileManager = function()
{
    this.tiles = {};
}

TileManager.prototype.createTile = function(src, name, offsetX, offsetY, width, height)
{
    if (this.tiles[name]) {
        throw new Error("Tile " + name + " already defined");
    }
    var tile = new this.Tile(src, offsetX, offsetY, width, height);
    this.tiles[name] = tile;
    return tile;
}


TileManager.Tile = function(src, x, y, w, h)
{
    this.src = src;
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
}

TileManager.Tile.prototype.createElement = function()
{
    return $('<div class="tile"/>')
        .css({
            'background-image': 'url(' + this.src + ')',
            'background-position': '-' + this.x + 'px -' + this.y + 'px',
            'position': 'absolute',
            'height': this.h,
            'width': this.w,
        });
}
