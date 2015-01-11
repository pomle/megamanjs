Engine.assets.objects.items.EnergyCapsule = function()
{
    Engine.assets.objects.Item.call(this);

    this.addCollisionZone(8, 0, 0);

    this.capacity = 100;

    var texture = THREE.ImageUtils.loadTexture('sprites/powerup/energy-capsule.gif');

    var material = new THREE.MeshLambertMaterial({});
    material.transparent = true;
    material.map = texture;

    var model = new THREE.Mesh(
        new THREE.PlaneBufferGeometry (16, 16),
        material
    );

    this.sprite = new Engine.Sprite(texture);
    this.sprite.addFrames([.1,.1]);
    this.sprite.play();

    this.setModel(model);
}

Engine.assets.objects.items.EnergyCapsule.prototype = Object.create(Engine.assets.objects.Item.prototype);
Engine.assets.objects.items.EnergyCapsule.constructor = Engine.assets.objects.items.EnergyCapsule;

