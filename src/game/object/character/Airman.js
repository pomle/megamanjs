Game.objects.characters.Airman = function()
{
    Game.objects.Character.call(this);
    this.isBlowing = false;
}

Engine.Util.extend(Game.objects.characters.Airman,
                   Game.objects.Character);

Game.objects.characters.Airman.prototype.routeAnimation = function()
{
    var anim = this.animators[0];

    if (this.weapon._firing) {
        return anim.pickAnimation('fire');
    }

    if (!this.isSupported) {
        return anim.pickAnimation('jump');
    }

    if (this.isBlowing) {
        return anim.pickAnimation('blow');
    }

    return anim.pickAnimation('idle');
}
