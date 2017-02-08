const Timeline = require('./Timeline');

class Animation
{
    constructor(id, group = null)
    {
        this._value = null;
        this._duration = null;

        this.id = id;
        this.group = group;

        this.length = 0;
        this.timeline = null;
    }

    addFrame(value, duration)
    {
        /* If this is the first time addFrame is run,
           save the value and duration flat, since we
           will not need the Timeline class to resolve it. */
        if (this.length === 0) {
            this._value = value;
            this._duration = duration;
        }
        /* If addFrame is run more than once, create Timeline
           object, copy static frame to Timeline and tranform
           behavior to a multi frame Animation. */
        else {
            if (this.timeline === null) {
                this.timeline = new Timeline();
                this.timeline.addFrame(this._value, this._duration);
                this._value = null;
                this._duration = null;
            }

            this.timeline.addFrame(value, duration);
        }
        ++this.length;
    }

    getIndex(time)
    {
        if (this.timeline === null) {
            return 0;
        } else {
            return this.timeline.getIndexAtTime(time);
        }
    }

    getValue(index)
    {
        if (this.timeline === null) {
            return this._value;
        } else {
            return this.timeline.getValueAtIndex(index);
        }
    }
}

module.exports = Animation;
