Engine.Loader = function(game)
{
    this.game = game;
    this.resourceManager = new Engine.ResourceManager(this);
    this.resourceLoader = new Engine.ResourceLoader(this);

    this.textureScale = 1;
}
