Engine.assets.objects.Character = function()
{
	this.__proto__ = new Engine.assets.Object();
	var self = this;
	self.health = 100;

	self.setGravity(20);

	self.timeShift = function(t)
	{
		self.speed.y -= self.gravityForce;
		self.__proto__.timeShift(t);
	}
}

Engine.assets.objects.characters = {};
