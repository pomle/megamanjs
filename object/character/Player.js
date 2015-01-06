Characters.Player = function()
{
	this.__proto__ = new Character();
	var self = this;
	var jumpHeight = 500;

	self.jumpForce = 0;
	self.walkSpeed = 100;
	self.walk = 0;

	self.jumpStart = function()
	{
		self.jumpForce = jumpHeight;
		setTimeout(self.jumpEnd, 500);
	}

	self.jumpEnd = function()
	{
		self.jumpForce = 0;
	}

	self.timeShift = function(t)
	{
		self.speed.x = self.walkSpeed * self.walk;
		if (self.jumpForce > 0) {
			self.speed.y = -self.jumpForce;
			self.jumpForce -= jumpHeight/10;
		}
		self.__proto__.timeShift(t);
	}

	self.moveLeft = function()
	{
		self.walk = -1;
	}

	self.moveRight = function()
	{
		self.walk = 1;
	}

	self.stop = function()
	{
		self.walk = 0;
	}
}
