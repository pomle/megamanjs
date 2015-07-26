Engine.assets.decorations.Sweat = function()
{
    Engine.assets.Object.call(this);

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

    this.setModel(model);
    this.inertia.set(0, 10);
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
    Engine.assets.Decoration.prototype.timeShift.call(this, dt);
    this.lifetime += dt;
}
