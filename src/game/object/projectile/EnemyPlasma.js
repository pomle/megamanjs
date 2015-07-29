Engine.assets.projectiles.EnemyPlasma = function()
{
    Engine.assets.Projectile.call(this);

    var model = Engine.SpriteManager.createSingleTile('projectile/tiles.gif', 8, 8, 48, 0, 128, 128);

    this.mass = 0;
    this.setModel(model);
    this.addCollisionZone(4, 0, 0);
    this.setDamage(5);
    this.setSpeed(240);
}

Engine.assets.projectiles.EnemyPlasma.prototype = Object.create(Engine.assets.Projectile.prototype);
Engine.assets.projectiles.EnemyPlasma.constructor = Engine.assets.Projectile;


