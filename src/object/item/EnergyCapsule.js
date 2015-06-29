Engine.assets.objects.items.EnergyCapsule = function()
{
    Engine.assets.objects.Item.call(this);

    var model = Engine.Util.createSprite('powerup.png', 16, 16);
    this.sprites = new Engine.SpriteManager(model, 16, 16 , 64, 64);

    var anim = this.sprites.addSprite('idle');
    anim.addFrame(0, 32, .1);
    anim.addFrame(16, 32, .1);
    this.sprites.selectSprite('idle');
    this.sprites.applySprite();

    this.setModel(model);
    this.addCollisionRect(16, 16);
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

Engine.assets.objects.items.EnergyCapsule.prototype.timeShift = function(dt)
{
    this.sprites.timeShift(dt);
}
