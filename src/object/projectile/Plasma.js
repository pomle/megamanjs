Engine.assets.projectiles.Plasma = function()
{
    Engine.assets.Projectile.call(this);

    var model = Engine.Util.createSprite('projectile/plasma.gif', 8, 8);
    this.setModel(model);
    this.addCollisionZone(4, 0, 0);
    this.setDamage(3);
    this.setVelocity(240);
}

Engine.assets.projectiles.Plasma.prototype = Object.create(Engine.assets.Projectile.prototype);
Engine.assets.projectiles.Plasma.constructor = Engine.assets.Projectile;
