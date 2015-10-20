Engine.Animator = function()
{
    this._currentAnimation = undefined;
    this._currentGroup = undefined;
    this._currentIndex = undefined;

    this.name = "";

    this.offset = 0;
    this.time = 0;
}

Engine.Animator.prototype.copy = function(animator)
{
    this._currentAnimation = animator._currentAnimation;
    this._currentId = animator._currentId;
    this.animations = animator.animations;
}

Engine.Animator.prototype.reset = function()
{
    this.time = this.offset;
}

Engine.Animator.prototype.setAnimation = function(animation)
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
Engine.Animator.prototype.update = function(deltaTime)
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
Engine.Animator.prototype.updateForce = function(deltaTime)
{
    this._currentIndex = undefined;
    this.update(deltaTime);
}

Engine.Animator.Animation = function(id, group)
{
    this._value = undefined;
    this._duration = undefined;

    this.id = id;
    this.group = group;

    this.length = 0;
    this.timeline = undefined;
}

Engine.Animator.Animation.prototype.addFrame = function(value, duration)
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
        this.timeline = new Engine.Timeline();
        this.addFrame = function(value, duration) {
            ++this.length;
            this.timeline.addFrame.call(this.timeline, value, duration);
        }.bind(this);
        this.getIndex = this.timeline.getIndexAtTime.bind(this.timeline);
        this.getValue = this.timeline.getValueAtIndex.bind(this.timeline);
        this.addFrame(this._value, this._duration);
        this.addFrame(value, duration);
        this._value = undefined;
        this._duration = undefined;
    }
}

Engine.Animator.Animation.prototype.getIndex = function()
{
    return 0;
}

Engine.Animator.Animation.prototype.getValue = function()
{
    return this._value;
}
