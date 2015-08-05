Engine.Animator = function()
{
    this._currentAnimation = undefined;
    this._currentId = undefined;
    this.animations = {};
}

Engine.Animator.prototype.addAnimation = function(id, animation)
{
    if (this.animations[id]) {
        throw new TypeError('Animation "' + id + '" already defined');
    }
    this.animations[id] = animation;
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

    if (animation.group !== undefined && animation.group === this._currentAnimation.group) {
        animation.time = this._currentAnimation.time;
    } else {
        animation.time = 0;
    }

    this.setAnimation(animation);
    this._currentAnimation = animation;
    this._currentId = id;
}

Engine.Animator.prototype.setAnimation = function(animation)
{
    if (animation !== this._currentAnimation) {
        this._currentAnimation = animation;
        this._applyAnimation(animation);
    }
}

Engine.Animator.prototype.timeshift = function(deltaTime)
{
    this._currentAnimation.time += deltaTime;
}

Engine.Animator.prototype.update = function()
{
    this._applyAnimation(this._currentAnimation);
}


Engine.Animator.Animation = function()
{
    this.group = undefined;
    this.timeline = new Engine.Timeline();
    this.addFrame = this.timeline.addFrame.bind(this.timeline);
    this.time = 0;
}

Engine.Animator.Animation.prototype.getValue = function()
{
    return this.timeline.getValueAtTime(this.time);
}
