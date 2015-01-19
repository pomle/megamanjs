Engine.assets.objects.items.EnergyTank = function()
{
    Engine.assets.objects.Item.call(this);

    this.capacity = 30;

    var model = Engine.Util.createSprite('powerup/energy-tank-large.gif', 16, 16);
    this.sprite = new Engine.Sprite(model.material.map);
    this.sprite.addFrame(.1);
    this.sprite.addFrame(.1);
    this.sprite.play();

    this.setModel(model);
    this.addCollisionZone(8, 0, 0);
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
