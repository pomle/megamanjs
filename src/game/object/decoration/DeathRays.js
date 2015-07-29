Game.objects.decorations.DeathRays = function()
{
    Engine.Object.call(this);

    this.origin = new THREE.Vector3();
    this.lifetime = 2;
}

Game.objects.decorations.DeathRays.prototype = Object.create(Game.objects.Decoration.prototype);
Game.objects.decorations.DeathRays.constructor = Game.objects.decorations.DeathRays;
