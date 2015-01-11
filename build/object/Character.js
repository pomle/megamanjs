Engine.assets.objects.Character = function()
{
    this.__proto__ = new Engine.assets.Object();

    var self = this;
    var fireTimer;
    var jumpTimer;

    self.fireTimeout = .25;
    self.direction = undefined;
    self.health = new Engine.assets.Energy(100);
    self.isFiring = false;
    self.jumpForce = 155;
    self.jumpSpeed = 0;
    self.jumpTimeout = .18;
    self.moveSpeed = 0;
    self.walkAcc = 20;
    self.walkSpeed = 90;
    self.walk = 0;
    self.weapon = undefined;

    self.setGravity(10);

    self.equipWeapon = function(weapon)
    {
        if (weapon instanceof Engine.assets.Weapon !== true) {
            throw new Error('Invalid weapon');
        }
        self.weapon = weapon;
        self.weapon.setUser(self);
    }

    self.fire = function()
    {
        if (!self.weapon) {
            return false;
        }

        if (!self.weapon.fire()) {
            return false;
        }

        clearTimeout(fireTimer);
        self.isFiring = true;
        console.log(self.fireTimeout);
        fireTimer = setTimeout(function() { self.isFiring = false; }, self.fireTimeout * 1000);

        return true;
    }

    self.jumpStart = function()
    {
        if (!self.isSupported()) {
            return false;
        }
        self.jumpSpeed = self.jumpForce;
        jumpTimer = setTimeout(self.jumpEnd, self.jumpTimeout * 1000);
        return jumpTimer;
    }

    self.jumpEnd = function()
    {
        self.jumpSpeed = 0;
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

    self.setDirection = function(d)
    {
        self.direction = d;
    }

    self.setFireTimeout = function(seconds)
    {
        self.fireTimeout = seconds;
    }

    self.setJumpForce = function(force)
    {
        self.jumpForce = force;
    }

    self.setWalkspeed = function(speed)
    {
        self.walkSpeed = speed;
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
        if (self.jumpSpeed > 0) {
            self.speed.y = self.jumpSpeed;
        }
        //console.log('Move Speed: %f', self.moveSpeed);
        //console.log('Jump Force: %f', self.jumpSpeed);
        self.__proto__.timeShift(t);
    }
}

Engine.assets.objects.characters = {};
