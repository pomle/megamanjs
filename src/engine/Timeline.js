Engine.Timeline = function()
{
    this.name = undefined;

    this.index = 0;
    this.lastIndex;

    this.accumulatedTime = 0;
    this.totalDuration = 0;

    this.callbacks = [];
    this.frames = [];
}

Engine.Timeline.prototype.addCallback = function(callback, offset)
{
    this.callbacks.push({
        'lastIndex': undefined,
        'offset': offset || 0,
        'method': callback,
    });
}

Engine.Timeline.prototype.addFrame = function(value, duration)
{
    this.frames.push({
        'duration': duration,
        'value': value
    });
    this.totalDuration += duration;
}

Engine.Timeline.prototype.getIndex = function()
{
    return this.getIndexAtTime(this.accumulatedTime);
}

Engine.Timeline.prototype.getIndexAtTime = function(time)
{
    /*
        Because all JavaScript numbers are floats with finite precision
        there's a chance this will crash because the accumulative durations
        are less than infiniteTime.
    */
    if (this.frames.length === 1) {
        return 0;
    }

    time = this.getLoopTime(time);
    var i = 0, incrementalTime = 0, index = 0;
    do {
        index = i++;
        incrementalTime += this.frames[index].duration;
    } while (time >= incrementalTime);
    return index;
}

Engine.Timeline.prototype.getLoopTime = function(time)
{
    if (isFinite(this.totalDuration)) {
        return (time % this.totalDuration + this.totalDuration) % this.totalDuration;
    }
    return time;
}

Engine.Timeline.prototype.getValue = function()
{
    var index = this.getIndexAtTime(this.accumulatedTime);
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
    if (this.callbacks.length) {
        var index, callback, i, l = this.callbacks.length;
        for (i = 0; i < l; i++) {
            callback = this.callbacks[i];
            index = this.getIndexAtTime(this.accumulatedTime + callback.offset);
            if (index !== callback.lastIndex) {
                callback.method(this.getValueAtIndex(index));
                callback.lastIndex = index;
            }
        }
    }
}
