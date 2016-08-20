'use strict';

Engine.Animator =
class Animator
{
    constructor()
    {
        this._currentAnimation = null;
        this._currentGroup = null;
        this._currentIndex = null;

        this.name = '';

        this.offset = 0;
        this.time = 0;
    }

    _applyAnimation()
    {
        throw new Error('_applyAnimation not implemented');
    }

    reset()
    {
        this.time = this.offset;
    }

    setAnimation(animation)
    {
        if (this._currentAnimation === animation) {
            return;
        }

        if (animation.group === null || animation.group !== this._currentGroup) {
            this.reset();
        }

        this._currentGroup = animation.group;
        this._currentIndex = null;
        this._currentAnimation = animation;
    }

    update(deltaTime)
    {
        this.time += deltaTime || 0;
        this._applyAnimation(this._currentAnimation);
    }
}

Engine.Animator.Animation =
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
        if (this._value === null) {
            this.length = 1;
            this._value = value;
            this._duration = duration;
        }
        /* If addFrame is run more than once, create Timeline
           object, copy static frame to Timeline and tranform
           behavior to a multi frame Animation. */
        else {
            if (this.timeline === null) {
                this.timeline = new Engine.Timeline();
                this.timeline.addFrame(this._value, this._duration);
                this._value = null;
                this._duration = null;
            }

            this.timeline.addFrame(value, duration);
            ++this.length;
        }
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
