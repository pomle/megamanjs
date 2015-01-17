Engine.assets.objects.items.EnergyTank = function()
{
    Engine.assets.objects.Item.call(this);

    this.addCollisionZone(8, 0, 0);

    this.capacity = 30;

    var texture = THREE.ImageUtils.loadTexture('sprites/powerup/energy-tank-large.gif');

    var material = new THREE.MeshLambertMaterial({});
    material.transparent = true;
    material.map = texture;

    var model = new THREE.Mesh(
        new THREE.PlaneBufferGeometry (16, 16),
        material
    );

    this.sprite = new Engine.Sprite(texture);
    this.sprite.addFrame(.1);
    this.sprite.addFrame(.1);
    this.sprite.play();

    this.setModel(model);
}

Engine.assets.objects.items.EnergyTank.prototype = Object.create(Engine.assets.objects.Item.prototype);
Engine.assets.objects.items.EnergyTank.constructor = Engine.assets.objects.items.EnergyTank;

Engine.assets.objects.items.EnergyTank.prototype.collides = function(withObject, theirZone, ourZone)
{
    if (withObject instanceof Engine.assets.objects.Character) {
        withObject.health.refill(this.capacity);
        this.scene.removeObject(this);
    }
}
