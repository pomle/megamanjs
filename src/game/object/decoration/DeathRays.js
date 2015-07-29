Engine.assets.decorations.DeathRays = function()
{
    Engine.Object.call(this);

    this.origin = new THREE.Vector3();
    this.lifetime = 2;
}

Engine.assets.decorations.DeathRays.prototype = Object.create(Engine.assets.Decoration.prototype);
Engine.assets.decorations.DeathRays.constructor = Engine.assets.decorations.DeathRays;
