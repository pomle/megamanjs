/**
 * All Y values are negated to avoid having to specify
 * everything in XML as negative.
 */
Game.Loader.XML.Parser.ObjectParser = function(loader)
{
    Game.Loader.XML.Parser.call(this, loader);
}

Engine.Util.extend(Game.Loader.XML.Parser.ObjectParser, Game.Loader.XML.Parser);

Game.Loader.XML.Parser.ObjectParser.prototype.parse = function(objectsNode)
{
    var parser = this;

    if (!objectsNode.is('objects')) {
        throw new TypeError('Node not <objects>');
    }

    var parser = this;
    var loader = parser.loader;

    objectsNode.find('> texture').each(function() {
        var node = $(this);
        parser.parseTexture(node);
    });

    objectsNode.find('> object').each(function() {
        var objectNode = $(this);
        var type = objectNode.attr('type');
        var id = objectNode.attr('id');
        var object = parser.getObject(objectNode);
        parser.loader.game.resource.addAuto(id, object);
    });

    this.callback();
}
