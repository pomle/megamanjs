Engine.assets.objects.Character = function()
{
	this.__proto__ = new Engine.assets.Object();
	var self = this;
	self.health = 100;
	self.setGravity(10);

	self.timeShift = function(t)
	{
		self.__proto__.timeShift(t);
	}
}

Engine.assets.objects.characters = {};
