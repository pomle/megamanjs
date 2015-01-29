Engine.assets.objects.items.EnergyTank = function()
{
    Engine.assets.objects.Item.call(this);

    this.capacity = 30;

    var model = Engine.Util.createSprite('powerup/tiles.gif', 16, 16);

    var timeline = new Engine.Timeline();
    timeline.addFrame(Engine.Util.createUVMap(0, 0, 16, 16, 48, 48), .1);
    timeline.addFrame(Engine.Util.createUVMap(16, 0, 16, 16, 48, 48), .1);

    var uvAnimator = new Engine.UVAnimator(timeline, model.geometry, 0, 0);
    this.timeShift = timeline.timeShift.bind(timeline);

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
