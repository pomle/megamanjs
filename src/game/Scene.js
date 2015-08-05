Game.Scene = function(game, world)
{
    Engine.Events.call(this);

    if (game instanceof Game === false) {
        throw new Error("game instance of Game");
    }
    if (world instanceof Engine.World === false) {
        throw new Error("world not instance of Engine.World");
    }
    this.game = game;
    this.camera = world.camera;
    this.world = world;
}

Engine.Util.mixin(Game.Scene, Engine.Events);

Game.Scene.prototype.EVENT_CREATE = 'create';
Game.Scene.prototype.EVENT_DESTROY = 'destroy';
Game.Scene.prototype.EVENT_END = 'end';
Game.Scene.prototype.EVENT_START = 'start';

Game.Scene.prototype.__create = function()
{
    this.trigger(this.EVENT_CREATE, arguments);
}

Game.Scene.prototype.__destroy = function()
{
    this.game.engine.pause();
    this.trigger(this.EVENT_DESTROY, arguments);
}

Game.Scene.prototype.__end = function()
{
    this.__destroy();
    this.trigger(this.EVENT_END, arguments);
}

Game.Scene.prototype.__start = function()
{
    this.trigger(this.EVENT_START, arguments);
    this.game.engine.run();
}
