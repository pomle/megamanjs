Characters.MegaMan = function()
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

	this.__proto__ = new Characters.Player();
	var self = this;
	self.horizontalDirection = 'right';


	self.timeShift = function(t)
	{
		if (self.walk > 0) {
			self.horizontalDirection = 'right';
			self.sprite.src = SPRITES[self.horizontalDirection]['running'];
		}
		else if (self.walk < 0) {
			self.horizontalDirection = 'left';
			self.sprite.src = SPRITES[self.horizontalDirection]['running'];
		}
		else {
			self.sprite.src = SPRITES[self.horizontalDirection]['idle'];
		}
		self.__proto__.timeShift(t);
	}
}
