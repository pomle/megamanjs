Engine.Camera = function(camera)
{
    var self = this;
    self.bounds = [new Engine.Vector2(-150, -100), new Engine.Vector2(150, 100)];
    self.camera = camera;
    self.cameraS
    self.followObject = undefined;
    self.followTween = undefined;
    self.follow = [0,0];
    self.followObjectThreshold = new Engine.Vector2(0,0);

    self.follow = function(object, distance)
    {
        console.log('Following', object);
        self.followDistance = distance || self.camera.position.z;
        self.followObject = object;
        self.followTween = new TweenMax(self.camera.position, 1, {
            x: self.followObject.model.position.x,
            y: self.followObject.model.position.y
        });
        self.zoomTween = new TweenMax(self.camera.position, 3, {'z': self.followDistance});
    }

    self.jumpTo = function(x, y)
    {
        self.unfollow();
        self.camera.position.x = x;
        self.camera.position.y = y;
    }

    self.unfollow = function()
    {
        self.followObject = undefined;
    }

    self.updateTime = function(timeElapsed)
    {
        if (self.followObject) {
            var newX = self.followObject.model.position.x;
            var newY = self.followObject.model.position.y;
            if (newX != self.follow[0] || newY != self.follow[1]) {
                self.followTween.updateTo({
                    'x': newX,
                    'y': newY
                }, true);
            }
            var newZ = self.followDistance + Math.max(Math.abs(self.followObject.speed.x), Math.abs(self.followObject.speed.y));
            self.zoomTween.updateTo({
                'z': newZ
            }, true);
        }
    }
}
