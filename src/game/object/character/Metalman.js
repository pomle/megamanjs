Game.objects.characters.Metalman = function()
{
    Game.objects.Character.call(this);
}

Engine.Util.extend(Game.objects.characters.Metalman,
                   Game.objects.Character);

Game.objects.characters.Metalman.prototype.routeAnimation = function()
{
    var anim = this.animators[0];

    if (!this.isSupported) {
        if (this.weapon._firing) {
            return anim.pickAnimation('jump-fire');
        }
        return anim.pickAnimation('jump');
    }

    if (this.move._walkSpeed) {
        if (this.weapon._firing) {
            return anim.pickAnimation('fire');
        }
        return anim.pickAnimation('run');
    }

    if (this.weapon._firing) {
        return anim.pickAnimation('fire');
    }

    return anim.pickAnimation('idle');
}
