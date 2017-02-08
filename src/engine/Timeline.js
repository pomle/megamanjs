class Timeline
{
    constructor()
    {
        this.name = undefined;

        this.accumulatedTime = 0;
        this.totalDuration = 0;

        this.frames = [];
    }
    addFrame(value, duration)
    {
        this.frames.push({
            duration,
            value,
        });
        this.totalDuration += duration;
    }
    getIndex()
    {
        return this.getIndexAtTime(this.accumulatedTime);
    }
    getIndexAtTime(time)
    {
        return this.resolveTime(time).index;
    }
    getLoopTime(time)
    {
        if (isFinite(this.totalDuration)) {
            return (time % this.totalDuration + this.totalDuration) % this.totalDuration;
        }
        return time;
    }
    getValue()
    {
        return this.resolveTime(this.accumulatedTime).value;
    }
    getValueAtIndex(index)
    {
        return this.frames[index].value;
    }
    getValueAtTime(time)
    {
        return this.resolveTime(time).value;
    }
    resolveTime(totalTime)
    {
        /*
            Because all JavaScript numbers are floats with finite precision
            there's a chance this will crash because the accumulative durations
            are less than infiniteTime.
        */
        const time = this.getLoopTime(totalTime);

        let i = 0;
        let incrementalTime = 0;
        let index = 0;

        do {
            index = i++;
            incrementalTime = incrementalTime + this.frames[index].duration;
        }
        while (time >= incrementalTime);

        return {
            index: index,
            value: this.frames[index].value,
            passedLength: incrementalTime - this.frames[index].duration,
            resolvedLength: time,
        };
    }
    reset()
    {
        this.accumulatedTime = 0;
    }
}

module.exports = Timeline;
