Engine.assets.Projectile = function()
{
    this.__proto__ = new Engine.assets.Object();
    var self = this;
    self.damage = 0;
    self.emitter = undefined;
    self.reach = 300;
    self.origin = undefined;
    self.velocity = 0;

    self.collides = function(withObject, ourZone, theirZone)
    {
        if (!withObject.health) {
            return false;
        }

        if (self.emitter.uuid == withObject.uuid) {
            return false;
        }

        withObject.health.reduce(self.damage);

        console.log('Inflicting %f damage on %s', self.damage, withObject);
        self.scene.removeObject(self);

        return true;
    }

    self.setDamage = function(points)
    {
        self.damage = points;
    }

    self.setEmitter = function(character)
    {
        self.emitter = character;
        var origin = self.emitter.model.position.clone();
        origin.x += (12 * self.emitter.direction);
        origin.y += 1;
        self.setOrigin(origin);
    }

    self.setOrigin = function(vector)
    {
        self.model.position.x = vector.x;
        self.model.position.y = vector.y;
        self.origin = vector;
    }

    self.setReach = function(distance)
    {
        self.reach = distance;
    }

    self.setVelocity = function(v)
    {
        self.velocity = v;
    }

    self.timeShift = function(t)
    {
        if (self.origin) {
            if (self.model.position.distanceTo(self.origin) > self.reach) {
                self.scene.removeObject(self);
            }
        }
        self.__proto__.timeShift(t);
    }
}

Engine.assets.projectiles = {};
