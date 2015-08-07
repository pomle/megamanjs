Engine.Animator = function()
{
    this._currentAnimation = undefined;
    this._currentId = undefined;
    this._currentIndex = undefined;

    this.animations = {};
    this.offset = 0;
    this.time = 0;
}

Engine.Animator.prototype.addAnimation = function(id, animation)
{
    if (this.animations[id]) {
        throw new TypeError('Animation "' + id + '" already defined');
    }
    this.animations[id] = animation;
}

Engine.Animator.prototype.copy = function(animator)
{
    this._currentAnimation = animator._currentAnimation;
    this._currentId = animator._currentId;
    this.animations = animator.animations;
}

Engine.Animator.prototype.createAnimation = function(id, group)
{
    var animation = new Engine.Animator.Animation();
    animation.group = group;
    this.addAnimation(id, animation);
    return animation;
}

Engine.Animator.prototype.pickAnimation = function(id)
{
    if (this._currentId === id) {
        return;
    }
    var animation = this.animations[id];

    if (animation.group === undefined || animation.group !== this._currentAnimation.group) {
        this.time = this.offset;
    }

    this.setAnimation(animation);
    this._currentId = id;
}

Engine.Animator.prototype.setAnimation = function(animation)
{
    if (animation !== this._currentAnimation) {
        this._currentIndex = undefined;
        this._currentAnimation = animation;
    }
}

Engine.Animator.prototype.update = function(deltaTime)
{
    this.time += deltaTime;
    this._applyAnimation(this._currentAnimation);
}


Engine.Animator.Animation = function()
{
    this._value = undefined;
    this._duration = undefined;

    this.frames = 0;
    this.group = undefined;
    this.timeline = undefined;
}

Engine.Animator.Animation.prototype.addFrame = function(value, duration)
{
    /* If this is the first time addFrame is run,
       save the value and duration flat, since we
       will not need the Timeline class to resolve it. */
    if (this._value === undefined) {
        this._value = value;
        this._duration = duration;
    }
    /* If addFrame is run more than once, create Timeline
       object, copy static frame to Timeline and tranform
       behavior to a multi frame Animation. */
    else {
        this.timeline = new Engine.Timeline();
        this.addFrame = this.timeline.addFrame.bind(this.timeline);
        this.getIndex = this.timeline.getIndexAtTime.bind(this.timeline);
        this.getValue = this.timeline.getValueAtIndex.bind(this.timeline);
        this.addFrame(this._value, this._duration);
        this.addFrame(value, duration);

        this._value = undefined;
        this._duration = undefined;
    }

    ++this.frames;
}

Engine.Animator.Animation.prototype.getIndex = function()
{
    return 0;
}

Engine.Animator.Animation.prototype.getValue = function()
{
    return this._value;
}
