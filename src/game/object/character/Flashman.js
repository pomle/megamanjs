Game.objects.characters.Flashman = function()
{
    Game.objects.Character.call(this);
    this.isFlashing = false;
}

Engine.Util.extend(Game.objects.characters.Flashman,
                   Game.objects.Character);

Game.objects.characters.Flashman.prototype.routeAnimation = function()
{
    if (this.weapon._firing) {
        return 'fire';
    }

    if (!this.isSupported) {
        return 'jump';
    }

    if (this.move._walkSpeed) {
        return 'run';
    }

    if (this.isFlashing) {
        return 'flash';
    }

    return 'idle';
}
