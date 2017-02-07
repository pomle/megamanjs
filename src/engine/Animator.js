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

module.exports = Animator;
