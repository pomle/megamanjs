Game.objects.projectiles.Plasma = function()
{
    Game.objects.Projectile.call(this);

    var model = Engine.SpriteManager.createSingleTile('projectiles.png', 8, 8, 4, 4, 128, 128);
    this.setModel(model);
    this.addCollisionZone(4, 0, 0);
    this.setDamage(3);
    this.setSpeed(240);
}

Game.objects.projectiles.Plasma.prototype = Object.create(Game.objects.Projectile.prototype);
Game.objects.projectiles.Plasma.constructor = Game.objects.Projectile;
