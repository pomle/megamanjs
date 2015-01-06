Items.EnergyTank = function()
{
	this.__proto__ = new Item();
	var self = this;
	self.capacity = 100;

	self.sprite.src = 'sprites/powerup/energy-tank-large.gif';
}
