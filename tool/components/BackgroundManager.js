var BackgroundManager = function()
{
    this.backgrounds = [];
}

BackgroundManager.prototype.addBackground = function(x, y, background)
{
    this.backgrounds.push({
        "x": x,
        "y": y,
        "background": background,
    });
}

BackgroundManager.Background = function(x, y, width, height, tileWidth, tileHeight)
{
    this.x = x;
    this.y = y;
    this.height = height;
    this.width = width;

    this.tileHeight = tileHeight;
    this.tileWidth = tileWidth;

    var tiles = {
        x: width / tileWidth,
        y: height / tileHeight,
    };

    if ((tiles.x + tiles.y) % 1 != 0) {
        throw new Error("Width or height not evenly divisible by tile height or tile width");
    }

    this.tiles = new Array(tiles.x * tiles.y);
    this.len = tiles.x;
}

BackgroundManager.Background.prototype.createElement = function()
{
    var backgroundElement = $('<div class="background" type="background"/>');
    backgroundElement.css({
        "left": this.x,
        "position": "absolute",
        "top": this.y,
        "height": this.height,
        "width": this.width,
    });
    var i = 0;
        l = this.tiles.length;
    for (i = 0; i < l; i++) {
        if (this.tiles[i]) {
            var tileElement = this.tiles[i].createElement();
            var coord = this.indexToCoord(i);
            tileElement.css({
                "left": coord.x * this.tileWidth,
                "top": coord.y * this.tileHeight,
            });
            backgroundElement.append(tileElement);
        }
    }
    return backgroundElement;
}

BackgroundManager.Background.prototype.coordToIndex = function(x, y)
{
    return x + y * this.len;
}

BackgroundManager.Background.prototype.indexToCoord = function(i)
{
    var x = i % this.len;
    var y = Math.floor(i / this.len);
    return {"x": x, "y": y};
}

BackgroundManager.Background.prototype.getHeightSegs = function()
{
    return this.tiles.length / this.len;
}

BackgroundManager.Background.prototype.getWidthSegs = function()
{
    return this.len;
}

BackgroundManager.Background.prototype.getTile = function(x, y)
{
    var i = this.coordToIndex(x, y);
    return this.tiles[i];
}

BackgroundManager.Background.prototype.setTile = function(x, y, tile)
{
    var i = this.coordToIndex(x, y);
    this.tiles[i] = tile;
}
