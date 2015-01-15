Engine.Sprite = function(texture)
{
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;

    var self = this;
    var timer = null;
    var index = 0;
    var frame = 0;
    self.frames = [];
    self.texture = texture;

    self.addFrame = function(duration)
    {
        self.frames.push(duration);
        texture.repeat.set(1/self.frames.length, 1);
    }

    self.addFrames = function(durs)
    {
        var i;
        for (i in durs) {
            self.addFrame(durs[i]);
        }
    }

    self.pause = function()
    {
        clearTimeout(timer);
    }

    self.play = function()
    {
        if (self.frames.length <= 1) {
            return;
        }
        index = (frame++ % self.frames.length);
        texture.offset.x = index / self.frames.length;
        var duration = self.frames[index];
        timer = setTimeout(self.play, duration*1000);
    }

    self.restart = function()
    {
        self.stop();
        self.play();
    }

    self.stop = function()
    {
        self.pause();
        frame = 0;
    }
}
