Engine.assets.decorations.Sweat = function()
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

Engine.assets.decorations.Sweat.prototype = Object.create(Engine.assets.Decoration.prototype);
Engine.assets.decorations.Sweat.constructor = Engine.assets.decorations.Sweat;

Engine.assets.decorations.Sweat.prototype.timeShift = function(dt)
{
    if (this.lifetime > this.lifespan) {
        this.scene.removeObject(this);
        return;
    }

    this.sprites.timeShift(dt);
    this.position.y += this.speed * dt;
    this.lifetime += dt;
}
