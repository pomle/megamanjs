var Object = function()
{
	var self = this;
	self.collision = [];
	self.gravityForce = 0;
	self.position = new Engine.Vector2();
	self.speed = new Engine.Vector2();
	self.sprite = new Image();

	self.addCollisionZone = function(r, x, y)
	{
		self.collision.push({'radius': r, 'x': x, 'y': y});
	}

	self.collides = function(withObject, ourZone, theirZone)
	{
		console.log(withObject, ourZone, theirZone);
	}

	self.setGravity = function(f)
	{
		self.gravityForce = f;
	}

	self.timeShift = function(t)
	{
		self.position.x += (self.speed.x * t);
		self.position.y += (self.speed.y * t);
	}
}

var Objects = {};
