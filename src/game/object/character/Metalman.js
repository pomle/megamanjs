Game.objects.characters.Metalman = function()
{
    Engine.Object.call(this);
}

Engine.Util.extend(Game.objects.characters.Metalman,
                   Engine.Object);

Game.objects.characters.Metalman.prototype.routeAnimation = function()
{
    if (!this.jump._ready) {
        if (this.weapon._firing) {
            return 'jump-fire';
        }
        return 'jump';
    }

    if (this.move._interimSpeed) {
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
