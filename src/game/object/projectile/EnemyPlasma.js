Game.objects.projectiles.EnemyPlasma = function()
{
    Game.objects.Projectile.call(this);

    var model = Engine.SpriteManager.createSingleTile('projectiles.png', 8, 8, 96, 0, 128, 128);

    this.setModel(model);
    this.addCollisionZone(4, 0, 0);
    this.setDamage(5);
    this.setSpeed(240);
}

Game.objects.projectiles.EnemyPlasma.prototype = Object.create(Game.objects.Projectile.prototype);
Game.objects.projectiles.EnemyPlasma.constructor = Game.objects.Projectile;


