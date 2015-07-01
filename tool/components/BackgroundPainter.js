var BackgroundPainter = function()
{

}

BackgroundPainter.Background = function(width, height, tileWidth, tileHeight)
{
    var x, y;
    this.height = height;
    this.width = width;

    var tiles = {
        x: width / tileWidth,
        y: height / tileHeight,
    };

    if ((tiles.x + tiles.y) % 1 != 0) {
        throw new Error("Width or height not evenly divisible by tile height or tile width");
    }

    this.tiles = new Array(tiles.x * tiles.y);
    this.len = tiles.y;
}

BackgroundPainter.Background.prototype.coordToIndex = function(x, y)
{
    return x + y * this.len;
}

BackgroundPainter.Background.prototype.indexToCoord = function(i)
{
    var y = Math.floor(i / this.len);
    var x = i % y;
    return {"x": x, "y": y};
}

BackgroundPainter.Background.prototype.getTile = function(x, y)
{
    var i = this.coordToIndex(x, y);
    return this.tiles[i];
}

BackgroundPainter.Background.prototype.setTile = function(x, y, tile)
{
    var i = this.coordToIndex(x, y);
    this.tiles[i] = tile;
}
