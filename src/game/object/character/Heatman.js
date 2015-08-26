Game.objects.characters.Heatman = function()
{
    Game.objects.Character.call(this);

    this.flameTransformDuration = .09;
    this.flameTransformTime = 0;
}

Engine.Util.extend(Game.objects.characters.Heatman,
                   Game.objects.Character);

Game.objects.characters.Heatman.prototype.routeAnimation = function()
{
    var anim = this.animators[0];

    if (this.move._walkSpeed) {
        if (this.flameTransformTime < this.flameTransformDuration) {
            this.flameTransformTime += this.deltaTime;
            return anim.pickAnimation('toFlame');
        }
        this.flameTransformTime = this.flameTransformDuration;
        return anim.pickAnimation('flame');
    }
    else {
        if (this.isFiring) {
            return anim.pickAnimation('fire');
        }

        if (!this.isSupported) {
            return anim.pickAnimation('jump');
        }

        if (this.isInvincible) {
            return anim.pickAnimation('burn');
        }
        if (this.flameTransformTime > 0) {
            this.flameTransformTime -= this.deltaTime;
            return anim.pickAnimation('fromFlame');
        }
        this.flameTransformTime = 0;
        return anim.pickAnimation('idle');
    }
}

Game.objects.characters.Heatman.prototype.timeShift = function(dt)
{
    if (this.move._walkSpeed === 0) {
        this.health.immune = false;
    }
    else {
        this.health.immune = true;
    }

    Game.objects.Character.prototype.timeShift.call(this, dt);
}
