Engine.assets.objects.characters.Player = function()
{
    this.__proto__ = new Engine.assets.objects.Character();
    var self = this;
    var jumpTimer;
    self.jumpForce = 0;
    self.moveSpeed = 0;
    self.walkAcc = 20;
    self.walkSpeed = 90;
    self.walk = 0;

    self.jumpStart = function()
    {
        if (!self.isSupported()) {
            return false;
        }
        self.jumpForce = 155;
        jumpTimer = setTimeout(self.jumpEnd, 180);
        return jumpTimer;
    }

    self.jumpEnd = function()
    {
        self.jumpForce = 0;
    }

    self.timeShift = function(t)
    {
        if (self.walk != 0) {
            self.moveSpeed = Math.min(self.moveSpeed + self.walkAcc, self.walkSpeed);
        }
        else {
            self.moveSpeed = 0;
        }
        self.speed.x = (self.moveSpeed * self.walk);
        if (self.jumpForce > 0) {
            self.speed.y = self.jumpForce;
        }
        //console.log('Move Speed: %f', self.moveSpeed);
        //console.log('Jump Force: %f', self.jumpForce);
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
