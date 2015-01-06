Items.EnergyTank = function()
{
	this.__proto__ = new Item();
	var self = this;
	self.capacity = 100;

	self.sprite.src = 'sprites/weapon-energy-tank.gif';
}
