Engine.Camera = function(camera)
{
    var self = this;
    self.camera = camera;
    self.followObject = undefined;
    self.followTween = undefined;

    self.follow = function(object, distance)
    {
        self.followObject = object;
        self.followTween = new TweenMax(self.camera.position, 1, {
            x: self.followObject.model.position.x,
            y: self.followObject.model.position.y
        });
        //self.zoomTween = new TweenMax(self.camera.position, 3, {'z': self.followDistance});
    }

    self.jumpTo = function(x, y)
    {
        self.unfollow();
        self.camera.position.x = x;
        self.camera.position.y = y;
    }

    self.panTo = function(x, y)
    {
        self.followTween.updateTo({
            'x': x,
            'y': y
        }, true);
    }

    self.unfollow = function()
    {
        self.followObject = undefined;
    }

    self.updateTime = function(timeElapsed)
    {
        if (self.followObject) {
            self.panTo(self.followObject.model.position.x, self.followObject.model.position.y);
            /*
            var newZ = self.followDistance + Math.max(Math.abs(self.followObject.speed.x), Math.abs(self.followObject.speed.y));
            self.zoomTween.updateTo({
                'z': newZ
            }, true);
            */
        }
    }
}
