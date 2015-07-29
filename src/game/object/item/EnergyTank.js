Engine.assets.objects.items.EnergyTank = function()
{
    Engine.assets.objects.Item.call(this);

    this.capacity = 30;

    var model = Engine.SpriteManager.createSprite('powerup.png', 16, 16);
    this.sprites = new Engine.SpriteManager(model, 16, 16 , 64, 64);

    var anim = this.sprites.addSprite('idle');
    anim.addFrame(0, 0, .1);
    anim.addFrame(16, 0, .1);
    this.sprites.selectSprite('idle');
    this.sprites.applySprite();

    this.setModel(model);
    this.addCollisionZone(8, 0, 0);
}

Engine.assets.objects.items.EnergyTank.prototype = Object.create(Engine.assets.objects.Item.prototype);
Engine.assets.objects.items.EnergyTank.constructor = Engine.assets.objects.items.EnergyTank;

Engine.assets.objects.items.EnergyTank.prototype.collides = function(withObject, theirZone, ourZone)
{
    if (withObject instanceof Engine.assets.objects.Character) {
        withObject.health.increase(this.capacity);
        this.scene.removeObject(this);
    }
}

Engine.assets.objects.items.EnergyTank.prototype.timeShift = function(dt)
{
    this.sprites.timeShift(dt);
}
