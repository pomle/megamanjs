Engine.assets.objects.items.WeaponTank = function()
{
    Engine.assets.objects.Item.call(this);

    this.capacity = 30;

    var model = Engine.Util.createSprite('powerup.png', 16, 12);
    this.sprites = new Engine.SpriteManager(model, 16, 12 , 64, 64);

    var anim = this.sprites.addSprite('idle');
    anim.addFrame(0, 20, .1);
    anim.addFrame(16, 20, .1);
    this.sprites.selectSprite('idle');
    this.sprites.applySprite();

    this.setModel(model);
    this.addCollisionRect(16, 12);
}

Engine.assets.objects.items.WeaponTank.prototype = Object.create(Engine.assets.objects.Item.prototype);
Engine.assets.objects.items.WeaponTank.constructor = Engine.assets.objects.items.WeaponTank;

Engine.assets.objects.items.WeaponTank.prototype.collides = function(withObject, theirZone, ourZone)
{
    if (withObject.weapon && withObject.weapon.ammo) {
        withObject.weapon.ammo.increase(this.capacity);
        this.scene.removeObject(this);
    }
}

Engine.assets.objects.items.WeaponTank.prototype.timeShift = function(dt)
{
    this.sprites.timeShift(dt);
}
