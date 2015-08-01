Game.objects.items.EnergyTank = function()
{
    Game.objects.Item.call(this);

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

Game.objects.items.EnergyTank.prototype = Object.create(Game.objects.Item.prototype);
Game.objects.items.EnergyTank.constructor = Game.objects.items.EnergyTank;

Game.objects.items.EnergyTank.prototype.collides = function(withObject, theirZone, ourZone)
{
    if (withObject instanceof Game.objects.Character) {
        withObject.health.amount += this.capacity;
        this.world.removeObject(this);
    }
}

Game.objects.items.EnergyTank.prototype.timeShift = function(dt)
{
    this.sprites.timeShift(dt);
}
