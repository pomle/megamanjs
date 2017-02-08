const Player = function()
{
    this.character = null;
    this.defaultWeapon = null;
    this.input = null;
    this.lives = 3;
    this.weapons = {};
}

Player.prototype.equipWeapon = function(code)
{
    if (!this.character.weapon) {
        return false;
    }
    var weapon = this.weapons[code];
    this.character.weapon.equip(weapon);
}

Player.prototype.setCharacter = function(character)
{
    if (this.character) {
        this.character.isPlayer = false;
    }
    this.character = character;
    this.character.isPlayer = true;
}

module.exports = Player;
