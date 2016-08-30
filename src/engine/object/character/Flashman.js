Game.objects.characters.Flashman = function()
{
    Engine.Object.call(this);
    this.isFlashing = false;
}

Engine.Util.extend(Game.objects.characters.Flashman,
                   Engine.Object);

Game.objects.characters.Flashman.prototype.routeAnimation = function()
{
    if (this.weapon._firing) {
        return 'fire';
    }

    if (!this.jump._ready) {
        return 'jump';
    }

    if (this.move._interimSpeed) {
        return 'run';
    }

    if (this.isFlashing) {
        return 'flash';
    }

    return 'idle';
}
