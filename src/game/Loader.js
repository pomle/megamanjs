Game.Loader = function(game)
{
    this.game = game;
    this.resourceManager = new Game.ResourceManager(this);
    this.resourceLoader = new Game.ResourceLoader(this);
}
