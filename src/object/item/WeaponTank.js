Engine.assets.objects.items.WeaponTank = function()
{
    Engine.assets.objects.Item.call(this);

    this.capacity = 30;

    var model = Engine.Util.createSprite('powerup/tiles.gif', 16, 12);

    var timeline = new Engine.Timeline();
    timeline.addFrame(Engine.Util.createUVMap(0, 20, 16, 12, 48, 48), .1);
    timeline.addFrame(Engine.Util.createUVMap(16, 20, 16, 12, 48, 48), .1);

    var uvAnimator = new Engine.UVAnimator(timeline, model.geometry, 0, 0);
    this.timeShift = timeline.timeShift.bind(timeline);

    this.setModel(model);
    this.addCollisionRect(16, 12);
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
