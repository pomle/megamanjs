Engine.Timeline = function()
{
    this.index = 0;
    this.lastIndex;

    this.accumulatedTime = 0;
    this.infiniteTime = 0;
    this.totalDuration = 0;

    this.callbacks = [];
    this.frames = [];
}

Engine.Timeline.prototype.addFrame = function(value, duration)
{
    this.frames.push({
        'duration': duration,
        'value': value
    });
    this.totalDuration += duration;
}

Engine.Timeline.prototype.onChange = function(callback)
{
    this.callbacks.push(callback);
}

Engine.Timeline.prototype.frameShift = function(steps)
{
    this.index = (this.index + steps) % this.frames.length;
    var i, time = 0;
    for (i = 0; i < this.index; i++) {
        time += this.frames[i].duration;
    }
    this.infiniteTime = time;
}

Engine.Timeline.prototype.getIndex = function()
{
    return this.getIndexAtTime(this.infiniteTime);
}

Engine.Timeline.prototype.getIndexAtTime = function(time)
{
    /*
        Because all JavaScript numbers are floats with finite precision
        there's a chance this will crash because the accumulative durations
        are less than infiniteTime.
    */
    var i = 0, incrementalTime = 0, index = 0;
    do {
        index = i++;
        incrementalTime += this.frames[index].duration;
    } while (time >= incrementalTime);
    return index;
}

Engine.Timeline.prototype.getValue = function()
{
    var index = this.getIndexAtTime(this.infiniteTime);
    return this.getValueAtIndex(index);
}

Engine.Timeline.prototype.getValueAtIndex = function(index)
{
    return this.frames[index].value;
}

Engine.Timeline.prototype.getValueAtTime = function(time)
{
    var index = this.getIndexAtTime(time);
    return this.getValueAtIndex(index);
}

Engine.Timeline.prototype.reset = function()
{
    this.accumulatedTime = 0;
}

Engine.Timeline.prototype.timeShift = function(diff)
{
    this.accumulatedTime += diff;
    this.infiniteTime = (this.accumulatedTime % this.totalDuration + this.totalDuration) % this.totalDuration;
    if (this.callbacks.length) {
        var nextIndex = this.getIndex();
        if (nextIndex !== this.lastIndex) {
            //console.log('Index updated from %d to %d', this.lastIndex, nextIndex);
            var i;
            for (i in this.callbacks) {
                this.callbacks[i].call(this.getValue());
            }
            this.lastIndex = nextIndex;
        }
    }
}
