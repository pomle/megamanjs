Engine.Timeline = function()
{
    var self = this;
    var index = 0;
    self.frames = [];
    self.accumulatedTime = 0;
    self.infiniteTime = 0;
    self.totalDuration = 0;

    self.addFrame = function(value, duration)
    {
        self.frames.push({
            'duration': duration,
            'value': value
        });
        self.totalDuration += duration;
    }

    self.frameShift = function(steps)
    {
        index = (index + steps) % self.frames.length;
        var i, time = 0;
        for (i = 0; i < index; i++) {
            time += self.frames[i].duration;
        }
        self.infiniteTime = time;
    }

    self.getIndex = function()
    {
        return self.getIndexAtTime(self.infiniteTime);
    }

    self.getIndexAtTime = function(time)
    {
        /*
            Because all JavaScript numbers are floats with finite precision
            there's a chance this will crash because the accumulative durations
            are less than infiniteTime.
        */
        var i = 0, incrementalTime = 0, index = 0;
        do {
            index = i++;
            incrementalTime += self.frames[index].duration;
        } while (time >= incrementalTime);
        return index;
    }

    self.getValue = function()
    {
        var index = self.getIndexAtTime(self.infiniteTime);
        return self.getValueAtIndex(index);
    }

    self.getValueAtIndex = function(index)
    {
        return self.frames[index].value;
    }

    self.getValueAtTime = function(time)
    {
        var index = self.getIndexAtTime(time);
        return self.getValueAtIndex(index);
    }

    self.reset = function()
    {
        self.accumulatedTime = 0;
    }

    self.timeShift = function(diff)
    {
        self.accumulatedTime += diff;
        self.infiniteTime = (self.accumulatedTime % self.totalDuration + self.totalDuration) % self.totalDuration;
    }
}
