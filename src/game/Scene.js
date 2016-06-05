Game.Scene = function(game, world)
{
    if (game instanceof Game === false) {
        throw new TypeError("Expected instance of game");
    }
    if (world instanceof Engine.World === false) {
        throw new TypeError("Expected instance of world");
    }
    this.audioPlayer = new Engine.AudioPlayer();
    this.events = new Engine.Events();
    this.input = new Engine.Keyboard();
    this.game = game;
    this.world = world;
}

Game.Scene.prototype.EVENT_CREATE = 'create';
Game.Scene.prototype.EVENT_DESTROY = 'destroy';
Game.Scene.prototype.EVENT_END = 'end';
Game.Scene.prototype.EVENT_START = 'start';

Game.Scene.prototype.__create = function()
{
    this.events.trigger(this.EVENT_CREATE, arguments);
}

Game.Scene.prototype.__destroy = function()
{
    this.audioPlayer.destroy();
    this.input.release();
    this.events.trigger(this.EVENT_DESTROY, arguments);
}

Game.Scene.prototype.__end = function()
{
    this.audioPlayer.stop();
    this.events.trigger(this.EVENT_END, arguments);
}

Game.Scene.prototype.__start = function()
{
    if (this.music) {
        this.audioPlayer.play(this.music);
    }
    this.events.trigger(this.EVENT_START, arguments);
}
