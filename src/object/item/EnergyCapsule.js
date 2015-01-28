Engine.assets.objects.items.EnergyCapsule = function()
{
    Engine.assets.objects.Item.call(this);

    var model = Engine.Util.createSprite('powerup/tiles.gif', 16, 16);

    var timeline = new Engine.Timeline();
    timeline.addFrame(Engine.Util.createUVMap(0, 32, 16, 16, 48, 48), .1);
    timeline.addFrame(Engine.Util.createUVMap(16, 32, 16, 16, 48, 48), .1);

    var uvAnimator = new Engine.UVAnimator(timeline, model.geometry, 0, 0);
    this.timeShift = timeline.timeShift.bind(timeline);

    this.setModel(model);
    this.addCollisionZone(8, 0, 0);
}

Engine.assets.objects.items.EnergyCapsule.prototype = Object.create(Engine.assets.objects.Item.prototype);
Engine.assets.objects.items.EnergyCapsule.constructor = Engine.assets.objects.items.EnergyCapsule;

Engine.assets.objects.items.EnergyCapsule.prototype.collides = function(withObject, theirZone, ourZone)
{
    if (withObject instanceof Engine.assets.objects.characters.Megaman) {
        withObject.energyCapsules++;
        this.scene.removeObject(this);
    }
}
