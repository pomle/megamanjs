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
    weapon.code = code;
    this.character.equipWeapon(weapon);
    this.hud.equipWeapon(weapon);
}

Game.Player.prototype.setCharacter = function(character)
{
    this.character = character;
}
