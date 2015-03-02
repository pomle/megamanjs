Engine.assets.obstacles.DestructibleWall = function(color)
{
    Engine.assets.Solid.call(this);

    var colors = {
        'orange': 0,
        'purple': 1,
        'pink': 2,
        'green': 3,
        'red': 4,
        'maroon': 5,
        'turqouise': 6,
    };

    var model = Engine.Util.createSprite('obstacles.gif', 16, 32);
    this.sprites = new Engine.SpriteManager(model, 16, 32 , 128, 128);

    var wall = this.sprites.addSprite('wall');
    wall.addFrame((colors[color] || 0) * 16, 0);
    this.sprites.selectSprite('wall');
    this.sprites.applySprite();

    this.setModel(model);
    this.addCollisionRect(16, 32)
}

Engine.assets.obstacles.DestructibleWall.prototype = Object.create(Engine.assets.Solid.prototype);
Engine.assets.obstacles.DestructibleWall.constructor = Engine.assets.obstacles.DestructibleWall;

Engine.assets.obstacles.DestructibleWall.prototype.collides = function(withObject, ourZone, theirZone)
{

    if (withObject instanceof Engine.assets.decorations.Explosion) {
        this.scene.removeObject(this);
        return;
    }

    if (withObject instanceof Engine.assets.Projectile) {
        if (withObject instanceof Engine.assets.projectiles.CrashBomb) {
            return;
        }

        withObject.momentumSpeed.x = -withObject.momentumSpeed.x;
        withObject.momentumSpeed.y = 100;
    }

    Engine.assets.Solid.prototype.collides.call(this, withObject, ourZone, theirZone);
}
