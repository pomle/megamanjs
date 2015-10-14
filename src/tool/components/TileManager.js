var TileManager = function()
{
    this.tiles = {};
}

TileManager.prototype.addTile = function(tile)
{
    if (this.tiles[tile.name]) {
        throw new Error("Tile " + tile.name + " already defined");
    }
    this.tiles[tile.name] = tile;
    return tile;
}

TileManager.prototype.getTile = function(name)
{
    if (!this.tiles[name]) {
        throw new Error("Tile " + name + " does not exist");
    }
    return this.tiles[name];
}


TileManager.Tile = function(src, name, x, y, w, h)
{
    this.name = name;
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


TileManager.TileAnimation = function()
{
    this.frames = [];
}

TileManager.TileAnimation.prototype.addFrame = function(tile, duration)
{
    this.frames.push({
        "tile": tile,
        "duration": duration,
    });
}
