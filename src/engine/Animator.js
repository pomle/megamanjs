'use strict';

Engine.Animator = class Animator
{
    constructor()
    {
        this._currentAnimation = undefined;
        this._currentGroup = undefined;
        this._currentIndex = undefined;

        this.name = "";

        this.offset = 0;
        this.time = 0;
    }

    copy(animator)
    {
        this._currentAnimation = animator._currentAnimation;
        this._currentId = animator._currentId;
        this.offset = animator.offset;
        this.animations = animator.animations;
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

        if (animation.group === undefined || animation.group !== this._currentGroup) {
            this.reset();
        }

        this._currentGroup = animation.group;
        this._currentIndex = undefined;
        this._currentAnimation = animation;
    }

    /**
     * Runs through all geometries and faces and updates their UV maps
     * if frames has changed between previous and previous + deltaTime.
     *
     * @param {Number} [deltaTime]
     */
    update(deltaTime)
    {
        this.time += deltaTime || 0;
        this._applyAnimation(this._currentAnimation);
    }

    /**
     * Runs through all geometries and faces and updates their UV maps
     * regardless of what their previous value was.
     *
     * @param {Number} [deltaTime]
     */
    updateForce(deltaTime)
    {
        this._currentIndex = undefined;
        this.update(deltaTime);
    }
}

Engine.Animator.Animation = class Animation
{
    constructor(id, group)
    {
        this._value = undefined;
        this._duration = undefined;

        this.id = id;
        this.group = group;

        this.length = 0;
        this.timeline = undefined;
    }

    addFrame(value, duration)
    {
        /* If this is the first time addFrame is run,
           save the value and duration flat, since we
           will not need the Timeline class to resolve it. */
        if (this._value === undefined) {
            this.length = 1;
            this._value = value;
            this._duration = duration;
        }
        /* If addFrame is run more than once, create Timeline
           object, copy static frame to Timeline and tranform
           behavior to a multi frame Animation. */
        else {
            if (this.timeline === undefined) {
                this.timeline = new Engine.Timeline();
                this.timeline.addFrame(this._value, this._duration);
            }

            this.timeline.addFrame(value, duration);
            ++this.length;
        }
    }

    getIndex(time)
    {
        if (this.timeline === undefined) {
            return 0;
        } else {
            return this.timeline.getIndexAtTime(time);
        }
    }

    getValue(index)
    {
        if (this.timeline === undefined) {
            return this._value;
        } else {
            return this.timeline.getValueAtIndex(index);
        }
    }
}
