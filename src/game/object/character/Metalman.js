Game.objects.characters.Metalman = function()
{
    Game.objects.Character.call(this);
}

Engine.Util.extend(Game.objects.characters.Metalman,
                   Game.objects.Character);

Game.objects.characters.Metalman.prototype.routeAnimation = function()
{
    if (!this.isSupported) {
        if (this.weapon._firing) {
            return 'jump-fire';
        }
        return 'jump';
    }

    if (this.move._walkSpeed) {
        if (this.weapon._firing) {
            return 'fire';
        }
        return 'run';
    }

    if (this.weapon._firing) {
        return 'fire';
    }

    return 'idle';
}
