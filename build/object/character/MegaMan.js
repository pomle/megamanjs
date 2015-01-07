Engine.assets.objects.characters.MegaMan = function()
{
	var SPRITES = {
		'left': {
			'idle': 'sprites/megaman/idle-left.gif',
			'running': 'sprites/megaman/running-left.gif',
		},
		'right': {
			'idle': 'sprites/megaman/idle-right.gif',
			'running': 'sprites/megaman/running-right.gif',
		},
	};

	this.__proto__ = new Engine.assets.objects.characters.Player();
	var self = this;
	self.horizontalDirection = 'right';


	self.timeShift = function(t)
	{
		self.model.rotation.y -= t*5;
		if (self.walk > 0) {
			self.horizontalDirection = 'right';
			//self.sprite.src = SPRITES[self.horizontalDirection]['running'];
		}
		else if (self.walk < 0) {
			self.horizontalDirection = 'left';
			//self.sprite.src = SPRITES[self.horizontalDirection]['running'];
		}
		else {
			//self.sprite.src = SPRITES[self.horizontalDirection]['idle'];
		}
		self.__proto__.timeShift(t);
	}
}
