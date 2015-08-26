Game.objects.characters.Crashman = function()
{
    Game.objects.Character.call(this);
}

Engine.Util.extend(Game.objects.characters.Crashman,
                   Game.objects.Character);

Game.objects.characters.Crashman.prototype.routeAnimation = function()
{
    var anim = this.animators[0];

    if (!this.isSupported) {
        if (this.weapon._firing) {
            return anim.pickAnimation('jump-fire');
        }
        return anim.pickAnimation('jump');
    }

    if (this.move._walkSpeed) {
        return anim.pickAnimation('run');
    }

    return anim.pickAnimation('idle');
}
