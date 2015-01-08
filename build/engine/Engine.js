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
                self.scene.camera.updateTime(t);
                self.render();
            });
        }

        self.timer.start();
    }

    self.pause = function()
    {
        self.timer.stop();
        self.timer.callbacks = [];
    }

    self.render = function()
    {
        renderer.render(self.scene.scene, self.scene.camera.camera);
    }
}

Engine.Vector2 = function(x, y)
{
    var self = this;
    self.x = x || 0;
    self.y = y || 0;
}

Engine.assets = {};
