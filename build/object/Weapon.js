Engine.assets.Weapon = function()
{
    var self = this;
    var coolDownTimer;
    self.ammo = -1;
    self.coolDown = 0;
    self.isReady = true;
    self.isFiring = false;
    self.user = undefined;

    self.fire = function()
    {
        if (!self.isReady) {
            return false;
        }

        if (self.ammo == 0) {
            return false;
        }

        if (self.ammo > 0) {
            self.ammo--;
        }

        if (self.coolDown > 0) {
            self.isReady = false;
            coolDownTimer = setTimeout(self.ready, self.coolDown * 1000);
        }

        return true;
    }

    self.ready = function()
    {
        self.isReady = true;
    }

    self.setAmmo = function(value)
    {
        self.ammo = value;
    }

    self.setCoolDown = function(duration)
    {
        self.coolDown = duration;
    }

    self.setUser = function(user)
    {
         /*if (user instanceof Engine.assets.objects.Character !== true) {
            throw new Error('Invalid user');
        }*/
        self.user = user;
    }
}

Engine.assets.weapons = {};
