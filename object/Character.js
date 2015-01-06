var Character = function()
{
	this.__proto__ = new Object();
	var self = this;
	self.health = 100;

	self.setGravity(30);

	self.timeShift = function(t)
	{
		self.speed.y += self.gravityForce;
		self.__proto__.timeShift(t);
	}
}

var Characters = {};
