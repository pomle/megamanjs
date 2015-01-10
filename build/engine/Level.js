Engine.scenes.Level = function()
{
    this.__proto__ = new Engine.Scene();
    var self = this;
    self.collision = new Engine.Collision();
    self.camera.camera.position.z = 120;
    self.startPosition = new Engine.Vector2();

    self.addObject = function(o)
    {
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
        player.model.position.x = self.startPosition.x;
        player.model.position.y = -self.startPosition.y;
        self.addObject(player);
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
