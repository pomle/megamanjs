Engine.Sprite = function(texture)
{
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;

    var self = this;
    var timer = null;
    var pointer = 0;
    var stack = [];
    self.frames = [];
    self.texture = texture;

    self.addFrame = function(duration, count)
    {
        var frame = {
            'index': self.frames.length,
            'duration': duration,
            'count': count || -1
        };
        console.log(frame);
        self.frames.push(frame);
        stack.push(frame);
        texture.repeat.set(1 / self.frames.length, 1);
        return frame;
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
        if (stack.length <= 1) {
            return;
        }
        var frame = stack.shift();
        self.update(frame);
        timer = setTimeout(self.play, frame.duration*1000);
        if (frame.count > -1 && --frame.count == 0) {
            return;
        }
        stack.push(frame);
        return frame;
    }

    self.restart = function()
    {
        self.stop();
        self.play();
    }

    self.stop = function()
    {
        self.pause();
        stack = self.frames.slice(0);
    }

    self.update = function(frame)
    {
        texture.offset.x = frame.index / self.frames.length;
    }
}
