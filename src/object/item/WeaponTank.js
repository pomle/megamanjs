Engine.assets.objects.items.WeaponTank = function()
{
    this.__proto__ = new Engine.assets.objects.Item();
    var self = this;

    self.addCollisionZone(8, 0, 0);

    self.capacity = 100;

    var texture = THREE.ImageUtils.loadTexture('sprites/powerup/weapon-tank-large.gif');

    var material = new THREE.MeshLambertMaterial({});
    material.transparent = true;
    material.map = texture;

    var model = new THREE.Mesh(
        new THREE.PlaneBufferGeometry (16, 16),
        material
    );

    self.sprite = new Engine.Sprite(texture);
    self.sprite.addFrame(.1);
    self.sprite.addFrame(.1);
    self.sprite.play();

    self.setModel(model);
}
