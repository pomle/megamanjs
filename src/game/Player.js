Game.Player = function()
{
    this.character = undefined;
    this.defaultWeapon = undefined;
    this.hud = undefined;
    this.input = undefined;
    this.lives = 3;
    this.weapons = {};
}

Game.Player.prototype.equipWeapon = function(code)
{
    if (!this.character.weapon) {
        return false;
    }
    var weapon = this.weapons[code];
    this.character.weapon.equip(weapon);
    this.hud.equipWeapon(weapon);
}

Game.Player.prototype.setCharacter = function(character)
{
    if (this.character) {
        this.character.isPlayer = false;
    }
    this.character = character;
    this.character.isPlayer = true;
    this.hud.equipCharacter(game.player.character);
}
