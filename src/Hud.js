var Hud = function(screen)
{
	screen = $(screen);

	this.elements = {
		'healthBar': screen.find('.health'),
		'weaponBar': screen.find('.weapon'),
	};

	var character = undefined;
	var weapon = undefined;

	this.equipCharacter = function(newChar)
	{
		if (character) {
			character.health.event = function(){};
		}
		character = newChar;
		this.setHealthEnergy(character.health.fraction);
		character.health.event = function(health) {
			this.setHealthEnergy(character.health.fraction);
		}.bind(this);
	}

	this.equipWeapon = function(newWeapon)
	{
		if (weapon) {
			weapon.ammo.event = function(){};
			this.elements.weaponBar.removeClass(weapon.code);
		}
		weapon = newWeapon;
		this.elements.weaponBar.addClass(weapon.code);
		this.setWeaponEnergy(weapon.ammo.getFraction());
		weapon.ammo.event = function(ammo) {
			this.setWeaponEnergy(ammo.getFraction());
		}.bind(this);
	}

	this.setHealthEnergy = function(frac)
	{
		setEnergyQuantified(this.elements.healthBar, frac);
	}

	this.setWeaponEnergy = function(frac)
	{
		setEnergyQuantified(this.elements.weaponBar, frac);
	}

	function setEnergyQuantified(element, frac)
	{
		// Quantify to whole 1/28th increments (full energy bar).
		var s = 1/27;
		var q = frac - (frac % s);
		if (frac > 0 && q == 0) {
			q = s;
		}
		element.children('.amount').css('height', (q * 100) + '%');
		return q;
	}
}
