Engine.assets.objects.items.EnergyCapsule = function()
{
    Engine.assets.objects.Item.call(this);

    var model = Engine.Util.createSprite('powerup/energy-capsule.gif', 16, 16);
    this.sprite = new Engine.Sprite(model.material.map);
    this.sprite.addFrame(.1);
    this.sprite.addFrame(.1);
    this.sprite.play();

    this.setModel(model);
    this.addCollisionZone(8, 0, 0);
}

Engine.assets.objects.items.EnergyCapsule.prototype = Object.create(Engine.assets.objects.Item.prototype);
Engine.assets.objects.items.EnergyCapsule.constructor = Engine.assets.objects.items.EnergyCapsule;

