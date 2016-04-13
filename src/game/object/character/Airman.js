Game.objects.characters.Airman = function()
{
    Game.objects.Character.call(this);
    this.isBlowing = false;
}

Engine.Util.extend(Game.objects.characters.Airman,
                   Game.objects.Character);

Game.objects.characters.Airman.prototype.routeAnimation = function()
{
    if (this.weapon._firing) {
        return 'fire';
    }

    if (!this.jump._ready) {
        return 'jump';
    }

    if (this.isBlowing) {
        return 'blow';
    }

    return 'idle';
}
