Game.objects.items.ExtraLife = function()
{
    Game.objects.Item.call(this);


    var model = Engine.SpriteManager.createSprite('powerup.png', 16, 16);
    this.sprites = new Engine.SpriteManager(model, 16, 16 , 64, 64);

    var anim = this.sprites.addSprite('idle');
    anim.addFrame(32, 0);
    this.sprites.selectSprite('idle');
    this.sprites.applySprite();

    this.setModel(model);
    this.addCollisionZone(8, 0, 0);
}

Game.objects.items.ExtraLife.prototype = Object.create(Game.objects.Item.prototype);
Game.objects.items.ExtraLife.constructor = Game.objects.items.ExtraLife;

Game.objects.items.ExtraLife.prototype.collides = function(withObject, theirZone, ourZone)
{
    if (withObject instanceof Game.objects.characters.Megaman) {
        withObject.lifes++;
        this.world.removeObject(this);
    }
}
