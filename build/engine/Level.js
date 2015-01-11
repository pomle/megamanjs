Engine.scenes.Level = function()
{
    this.__proto__ = new Engine.Scene();
    var self = this;
    self.collision = new Engine.Collision();
    self.camera.camera.position.z = 120;
    self.startPosition = new THREE.Vector2();

    self.addObject = function(o, x, y)
    {
        o.model.position.x = x === undefined ? o.model.position.x : x;
        o.model.position.y = y === undefined ? o.model.position.y : y;
        self.__proto__.addObject(o);
        self.collision.addObject(o);
        o.setScene(self);
    }

    self.removeObject = function(o)
    {
        self.__proto__.removeObject(o);
        self.collision.removeObject(o);
    }

    self.addPlayer = function(player)
    {
        self.addObject(player, self.startPosition.x, -self.startPosition.y);
        self.camera.follow(player);
    }

    self.setStartPosition = function(x, y)
    {
        self.startPosition.x = x;
        self.startPosition.y = y;
        self.camera.jumpTo(x, -y);
    }

    self.updateTime = function(timeElapsed)
    {
        self.__proto__.updateTime(timeElapsed);
        self.collision.detect();
    }
}

Engine.scenes.levels = {};
