Game.objects.characters.Crashman = function()
{
    Game.objects.Character.call(this);
}

Engine.Util.extend(Game.objects.characters.Crashman,
                   Game.objects.Character);

Game.objects.characters.Crashman.prototype.routeAnimation = function()
{
    if (!this.jump._ready) {
        if (this.weapon._firing) {
            return 'jump-fire';
        }
        return 'jump';
    }

    if (this.move._interimSpeed) {
        return 'run';
    }

    return 'idle';
}
