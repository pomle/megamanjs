Game.objects.decorations.Sweat = function()
{
    Engine.Object.call(this);

    var model = Engine.SpriteManager.createSprite('explosions.png', 32, 16);
    this.sprites = new Engine.SpriteManager(model, 32, 16 , 256, 256);

    var sweat = this.sprites.addSprite('sweat');
    sweat.addFrame(144,  0, .15);
    sweat.addFrame(144, 16, .15);
    sweat.addFrame(144, 32);

    this.sprites.selectSprite('sweat');
    this.sprites.applySprite();

    this.lifetime = 0;
    this.lifespan = .45;
    this.speed = 10;

    this.setModel(model);
}

Game.objects.decorations.Sweat.prototype = Object.create(Game.objects.Decoration.prototype);
Game.objects.decorations.Sweat.constructor = Game.objects.decorations.Sweat;

Game.objects.decorations.Sweat.prototype.timeShift = function(dt)
{
    if (this.lifetime > this.lifespan) {
        this.scene.removeObject(this);
        return;
    }

    this.sprites.timeShift(dt);
    this.position.y += this.speed * dt;
    this.lifetime += dt;
}
