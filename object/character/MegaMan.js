Characters.MegaMan = function()
{
	this.__proto__ = new Characters.Player();
	var self = this;
	self.sprite.src = 'sprites/megaman-shoot-right.gif';

	self.timeShift = function(t)
	{
		if (self.walk > 0) {
			self.sprite.src = 'sprites/megaman-shoot-right.gif';
		}
		else if (self.walk < 0) {
			self.sprite.src = 'sprites/megaman-shoot-left.gif';
		}
		self.__proto__.timeShift(t);
	}
}
