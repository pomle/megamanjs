Engine.Camera = function(camera)
{
    var self = this;
    self.bounds = [new Engine.Vector2(-150, -100), new Engine.Vector2(150, 100)];
    self.camera = camera;
    self.followObject = undefined;
    self.followObjectThreshold = new Engine.Vector2(0,0);

    self.follow = function(object, x, y)
    {
        self.followObject = object;
        self.followObjectThreshold.x = x;
        self.followObjectThreshold.y = y;
    }

    self.updateTime = function(timeElapsed)
    {
    }
}
