Game.objects.projectiles.SillyShot = function()
{
    Game.objects.Projectile.call(this);

    var model = Engine.SpriteManager.createSingleTile('projectile/tiles.gif', 8, 8, 48, 0, 128, 128);

    this.mass = 1;
    this.setModel(model);
    this.addCollisionZone(4, 0, 0);
    this.setDamage(5);
    this.setSpeed(240);
}

Game.objects.projectiles.SillyShot.prototype = Object.create(Game.objects.Projectile.prototype);
Game.objects.projectiles.SillyShot.constructor = Game.objects.Projectile;


