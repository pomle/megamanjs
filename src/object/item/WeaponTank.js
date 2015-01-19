Engine.assets.objects.items.WeaponTank = function()
{
    Engine.assets.objects.Item.call(this);

    this.capacity = 100;

    var model = Engine.Util.createSprite('powerup/weapon-tank-large.gif', 16, 12);
    this.sprite = new Engine.Sprite(model.material.map);
    this.sprite.addFrame(.1);
    this.sprite.addFrame(.1);
    this.sprite.play();

    this.setModel(model);
    this.addCollisionZone(8, 0, 0);
}

Engine.assets.objects.items.WeaponTank.prototype = Object.create(Engine.assets.objects.Item.prototype);
Engine.assets.objects.items.WeaponTank.constructor = Engine.assets.objects.items.WeaponTank;

Engine.assets.objects.items.WeaponTank.prototype.collides = function(withObject, theirZone, ourZone)
{
    if (withObject.weapon && withObject.weapon.ammo) {
        withObject.weapon.ammo.refill(this.capacity);
        this.scene.removeObject(this);
    }
}
