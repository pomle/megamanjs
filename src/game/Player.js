Game.Player = function()
{
    this.character = undefined;
    this.hud = undefined;
    this.input = undefined;
    this.lives = 3;
    this.weapons = {};
}

Game.Player.prototype.equipWeapon = function(code)
{
    var weapon = this.weapons[code];
    this.character.weapon.equip(weapon);
    this.hud.equipWeapon(weapon);
}

Game.Player.prototype.setCharacter = function(character)
{
    this.character = character;
}
