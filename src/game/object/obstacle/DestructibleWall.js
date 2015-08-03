Game.objects.obstacles.DestructibleWall = function(color)
{
    Game.objects.Solid.call(this);

    var colors = {
        'orange': 0,
        'purple': 1,
        'pink': 2,
        'green': 3,
        'red': 4,
        'maroon': 5,
        'turqouise': 6,
    };

    var model = Engine.SpriteManager.createSprite('obstacles.gif', 16, 32);
    this.sprites = new Engine.SpriteManager(model, 16, 32 , 128, 128);

    var wall = this.sprites.addSprite('wall');
    wall.addFrame((colors[color] || 0) * 16, 0);
    this.sprites.selectSprite('wall');
    this.sprites.applySprite();

    this.setModel(model);
    this.addCollisionRect(16, 32)
}

Game.objects.obstacles.DestructibleWall.prototype = Object.create(Game.objects.Solid.prototype);
Game.objects.obstacles.DestructibleWall.constructor = Game.objects.obstacles.DestructibleWall;

Game.objects.obstacles.DestructibleWall.prototype.collides = function(withObject, ourZone, theirZone)
{
    if (withObject instanceof Game.objects.decorations.Explosion) {
        this.world.removeObject(this);
        return;
    }

    if (withObject instanceof Game.objects.Projectile) {
        if (withObject instanceof Game.objects.projectiles.CrashBomb) {
            return;
        }

        withObject.inertia.x = -withObject.inertia.x;
        withObject.inertia.y = 100;
    }

    Game.objects.Solid.prototype.collides.call(this, withObject, ourZone, theirZone);
}
