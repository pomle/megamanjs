Game.objects.items.WeaponTank = function()
{
    Game.objects.Item.call(this);

    this.capacity = 30;

    var model = Engine.SpriteManager.createSprite('powerup.png', 16, 12);
    this.sprites = new Engine.SpriteManager(model, 16, 12 , 64, 64);

    var anim = this.sprites.addSprite('idle');
    anim.addFrame(0, 20, .1);
    anim.addFrame(16, 20, .1);
    this.sprites.selectSprite('idle');
    this.sprites.applySprite();

    this.setModel(model);
    this.addCollisionRect(16, 12);
}

Game.objects.items.WeaponTank.prototype = Object.create(Game.objects.Item.prototype);
Game.objects.items.WeaponTank.constructor = Game.objects.items.WeaponTank;

Game.objects.items.WeaponTank.prototype.collides = function(withObject, theirZone, ourZone)
{
    if (withObject.weapon && withObject.weapon.ammo) {
        withObject.weapon.ammo.increase(this.capacity);
        this.scene.removeObject(this);
    }
}

Game.objects.items.WeaponTank.prototype.timeShift = function(dt)
{
    this.sprites.timeShift(dt);
}
