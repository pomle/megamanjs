Engine.UVAnimator = function(geometry)
{
    if (geometry instanceof THREE.Geometry === false) {
        throw new Error('Invalid geometry');
    }

    var self = this;
    var timer;
    var index = 0;
    self.frames = [];
    self.accumulatedTime = 0;
    self.infiniteTime = 0;
    self.totalDuration = 0;

    self.addFrame = function(uvMap, duration)
    {
        self.frames.push({
            'uvMap': uvMap,
            'duration': duration
        });
        self.totalDuration += duration;
    }

    self.getFrameAtTime = function(time)
    {
        var i = 0, incrementalTime = 0;
        do {
            var frame = self.frames[i++];
            incrementalTime += frame.duration;
        } while (time >= incrementalTime);
        return frame;
    }

    self.pause = function()
    {
        clearTimeout(timer);
    }

    self.play = function()
    {
        clearTimeout(timer);
        self.update();
        timer = setTimeout(self.play, self.frames[index].duration * 1000);
        isPlaying = true;
        self.step(1);
    }

    self.step = function(steps)
    {
        index = (index + steps) % self.frames.length;
    }

    self.stop = function()
    {
        self.pause();
        index = 0;
    }

    self.timeShift = function(diff)
    {
        self.accumulatedTime += diff;
        self.infiniteTime = (self.accumulatedTime % self.totalDuration + self.totalDuration) % self.totalDuration;
    }

    self.update = function(frame)
    {
        geometry.faceVertexUvs[0] = self.frames[index].uvMap;
        geometry.uvsNeedUpdate = true;
    }
}
