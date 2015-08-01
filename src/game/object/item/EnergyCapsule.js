Game.objects.items.EnergyCapsule = function()
{
    Game.objects.Item.call(this);

    var model = Engine.SpriteManager.createSprite('powerup.png', 16, 16);
    this.sprites = new Engine.SpriteManager(model, 16, 16 , 64, 64);

    var anim = this.sprites.addSprite('idle');
    anim.addFrame(0, 32, .1);
    anim.addFrame(16, 32, .1);
    this.sprites.selectSprite('idle');
    this.sprites.applySprite();

    this.setModel(model);
    this.addCollisionRect(16, 16);
}

Game.objects.items.EnergyCapsule.prototype = Object.create(Game.objects.Item.prototype);
Game.objects.items.EnergyCapsule.constructor = Game.objects.items.EnergyCapsule;

Game.objects.items.EnergyCapsule.prototype.collides = function(withObject, theirZone, ourZone)
{
    if (withObject instanceof Game.objects.characters.Megaman) {
        withObject.energyCapsules++;
        this.world.removeObject(this);
    }
}

Game.objects.items.EnergyCapsule.prototype.timeShift = function(dt)
{
    this.sprites.timeShift(dt);
}
