var Engine = function()
{
    var self = this;
    self.camera = undefined;
    self.timer = undefined;
    self.scene = undefined;

    self.run = function()
    {
        if (self.scene) {
            self.timer.callbacks.push(function(t) {
                self.scene.updateTime(t);
            });
        }

        if (self.camera) {
            self.timer.callbacks.push(function(t) {
                self.camera.render();
            });
        }

        self.timer.start();
    }

    self.pause = function()
    {
        self.timer.stop();
        self.timer.callbacks = [];
    }
}

Engine.Vector2 = function(x, y)
{
    var self = this;
    self.x = x || 0;
    self.y = y || 0;
}
