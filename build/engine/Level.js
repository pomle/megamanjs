Engine.scenes.Level = function()
{
    this.__proto__ = new Engine.Scene();
    var self = this;
    self.collision = new Engine.Collision();

    self.addObject = function(o)
    {
        self.__proto__.addObject(o);
        self.collision.objects.push(o);
    }

    self.updateTime = function(timeElapsed)
    {
        self.__proto__.updateTime(timeElapsed);
        self.collision.detect();
    }
}
