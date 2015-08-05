Game.Loader.XML.Parser = function(loader)
{
    this.loader = loader;
    this.callback = function() {};
}

Game.Loader.XML.Parser.prototype.getRange = function(node, attr, total)
{
    var input = $(node).attr(attr || 'range');

    var values = [];
    var groups, group, ranges, range, mod, upper, lower, i;

    groups = input.split(',');

    while (group = groups.shift()) {

        mod = parseFloat(group.split('/')[1]) || 1;
        ranges = group.split('-');

        if (ranges.length == 2) {
            lower = parseFloat(ranges[0]);
            upper = parseFloat(ranges[1]);
        }
        else if (ranges[0] == '*') {
            lower = 1;
            upper = total;
        }
        else {
            lower = parseFloat(ranges[0]);
            upper = lower;
        }

        i = 0;
        while (lower <= upper) {
            if (i++ % mod === 0) {
                values.push(lower);
            }
            lower++
        }
    }

    return values;
}

Game.Loader.XML.Parser.prototype.getRect = function(node, attrX1, attrY1, attrX2, attrY2)
{
    var node = $(node);
    return [
        this.getVector2(node, attrX1 || 'x1', attrY1 || 'y1'),
        this.getVector2(node, attrX2 || 'x2', attrY2 || 'y2')
    ];
}

Game.Loader.XML.Parser.prototype.getVector2 = function(node, attrX, attrY)
{
    var node = $(node);
    return new THREE.Vector2(
        parseFloat(node.attr(attrX || 'x')) || undefined,
        -parseFloat(node.attr(attrY || 'y')) || undefined);
}

Game.Loader.XML.Parser.prototype.getVector3 = function(node, attrX, attrY, attrZ)
{
    var node = $(node);
    return new THREE.Vector3(
        parseFloat(node.attr(attrX || 'x')) || undefined,
        -parseFloat(node.attr(attrY || 'y')) || undefined,
        parseFloat(node.attr(attrZ || 'z')) || undefined);
}
