Engine.assets.objects.characters.Player = function()
{
    this.__proto__ = new Engine.assets.objects.Character();
    var self = this;
    var jumpTimer;
    self.jumpForce = 0;
    self.walkSpeed = 100;
    self.walk = 0;

    self.jumpStart = function()
    {
        if (!self.isSupported()) {
            return false;
        }
        self.jumpForce = 150;
        jumpTimer = setTimeout(self.jumpEnd, 180);
        return jumpTimer;
    }

    self.jumpEnd = function()
    {
        self.jumpForce = 0;
    }

    self.timeShift = function(t)
    {
        self.speed.x = self.walkSpeed * self.walk;
        //console.log('Jump Force: %f', self.jumpForce);
        if (self.jumpForce > 0) {
            self.speed.y = self.jumpForce;
        }
        self.__proto__.timeShift(t);
    }

    self.moveLeftStart = function()
    {
        self.walk--;
    }

    self.moveLeftEnd = function()
    {
        self.walk++;
    }

    self.moveRightStart = function()
    {
        self.walk++;
    }

    self.moveRightEnd = function()
    {
        self.walk--;
    }
}
