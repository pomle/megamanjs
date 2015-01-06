var Camera = function()
{
    var self = this;

    self.bounds = [new Engine.Vector2(-150, -100), new Engine.Vector2(150, 100)];
    self.context = undefined;
    self.followObject = undefined;
    self.followObjectThreshold = new Engine.Vector2(0,0);
    self.position = new Engine.Vector2(0,0);
    self.scene = undefined;

    self.follow = function(object, x, y)
    {
        self.followObject = object;
        self.followObjectThreshold.x = x;
        self.followObjectThreshold.y = y;
    }

    self.render = function()
    {
        self.context.clearRect(0, 0, 300, 200);

        if (self.followObject) {
            var maxX = self.position.x + self.followObjectThreshold.x;
            var minX = self.position.x - self.followObjectThreshold.x;
            if (self.followObject.position.x > maxX) {
                self.position.x = maxX;
            }
            else if (self.followObject.x < minX) {
                self.position.x = minX;
            }
        }

        var i, o, x, y;
        for (i in self.scene.objects) {
            o = self.scene.objects[i];
            x = o.position.x - self.position.x;
            y = o.position.y - self.position.y;
            self.context.drawImage(o.sprite, 0, 0, o.sprite.width, o.sprite.height, x, y, o.sprite.width, o.sprite.height);
        }
    }
}
