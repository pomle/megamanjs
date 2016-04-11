Game.Loader.XML.Parser.WeaponParser = function(loader)
{
    Game.Loader.XML.Parser.call(this, loader);
}

Engine.Util.extend(Game.Loader.XML.Parser.WeaponParser,
                   Game.Loader.XML.Parser);

Game.Loader.XML.Parser.WeaponParser.prototype.parse = function(weaponNode)
{
    if (weaponNode.tagName !== 'weapon') {
        throw new TypeError('Node not <weapon>');
    }

    var sourceName = weaponNode.getAttribute('source');
    var source = Game.objects.weapons[sourceName];

    var code = weaponNode.getAttribute('code');
    var name = weaponNode.getAttribute('name');

    var weapon = function() {
        source.call(this);
        this._parentName = sourceName;
        this.code = code;
        this.name = name;
    }

    Engine.Util.extend(weapon, source);

    return weapon;
}
