Engine.Timeline = function()
{
    this.name = undefined;

    this.accumulatedTime = 0;
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

Engine.Timeline.prototype.getIndex = function()
{
    return this.getIndexAtTime(this.accumulatedTime);
}

Engine.Timeline.prototype.getIndexAtTime = function(time)
{
    return this.resolveTime(time).index;
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
    return this.resolveTime(this.accumulatedTime).value;
}

Engine.Timeline.prototype.getValueAtIndex = function(index)
{
    return this.frames[index].value;
}

Engine.Timeline.prototype.getValueAtTime = function(time)
{
    return this.resolveTime(time).value;
}

Engine.Timeline.prototype.resolveTime = function(time)
{
    /*
        Because all JavaScript numbers are floats with finite precision
        there's a chance this will crash because the accumulative durations
        are less than infiniteTime.
    */
    time = this.getLoopTime(time);

    var i = 0,
        incrementalTime = 0,
        index = 0;

    do {
        index = i++;
        incrementalTime += this.frames[index].duration;
    }
    while (time >= incrementalTime);

    return {
        index: index,
        value: this.frames[index].value,
        passedLength: incrementalTime - this.frames[index].duration,
        resolvedLength: time,
    }
}

Engine.Timeline.prototype.reset = function()
{
    this.accumulatedTime = 0;
}
