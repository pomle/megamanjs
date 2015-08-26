Game.objects.characters.Flashman = function()
{
    Game.objects.Character.call(this);
    this.isFlashing = false;
}

Engine.Util.extend(Game.objects.characters.Flashman,
                   Game.objects.Character);

Game.objects.characters.Flashman.prototype.routeAnimation = function()
{
    var anim = this.animators[0];

    if (this.weapon._firing) {
        return anim.pickAnimation('fire');
    }

    if (!this.isSupported) {
        return anim.pickAnimation('jump');
    }

    if (this.move._walkSpeed) {
        return anim.pickAnimation('run');
    }

    if (this.isFlashing) {
        return anim.pickAnimation('flash');
    }

    return anim.pickAnimation('idle');
}
