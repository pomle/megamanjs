Engine.assets.objects.items.ExtraLife = function()
{
    Engine.assets.objects.Item.call(this);


    var model = Engine.Util.createSprite('powerup.png', 16, 16);
    this.sprites = new Engine.SpriteManager(model, 16, 16 , 64, 64);

    var anim = this.sprites.addSprite('idle');
    anim.addFrame(32, 0);
    this.sprites.selectSprite('idle');
    this.sprites.applySprite();

    this.setModel(model);
    this.addCollisionZone(8, 0, 0);
}

Engine.assets.objects.items.ExtraLife.prototype = Object.create(Engine.assets.objects.Item.prototype);
Engine.assets.objects.items.ExtraLife.constructor = Engine.assets.objects.items.ExtraLife;

Engine.assets.objects.items.ExtraLife.prototype.collides = function(withObject, theirZone, ourZone)
{
    if (withObject instanceof Engine.assets.objects.characters.Megaman) {
        withObject.lifes++;
        this.scene.removeObject(this);
    }
}
