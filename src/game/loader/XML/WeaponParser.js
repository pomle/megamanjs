Game.Loader.XML.Parser.WeaponParser = function(loader)
{
    Game.Loader.XML.Parser.call(this, loader);
}

Engine.Util.extend(Game.Loader.XML.Parser.WeaponParser,
                   Game.Loader.XML.Parser);

Game.Loader.XML.Parser.WeaponParser.prototype.parseWeapon = function(weaponNode)
{
    if (!weaponNode.is('weapon')) {
        throw new TypeError('Node not <weapon>');
    }

    var sourceName = weaponNode.attr('source');
    var source = Game.objects.weapons[sourceName];

    var code = weaponNode.attr('code');
    var name = weaponNode.attr('name');

    var weapon = function() {
        source.call(this);
        this._parentName = sourceName;
        this.code = code;
        this.name = name;
    }

    Engine.Util.extend(weapon, source);

    return weapon;
}
