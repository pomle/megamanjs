var Engine = function(renderer)
{
    var self = this;
    self.renderer = renderer;
    self.scene = undefined;
    self.timer = undefined;

    self.run = function()
    {
        if (self.scene) {
            self.timer.callbacks.push(function(t) {
                self.scene.updateTime(t);
                renderer.render(self.scene.scene, self.scene.camera.camera);
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

Engine.assets = {};
