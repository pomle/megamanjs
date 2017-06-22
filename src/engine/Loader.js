import ResourceLoader from './ResourceLoader';
import ResourceManager from './ResourceManager';

class Loader
{
    constructor(game)
    {
        this.game = game;
        this.resourceManager = new ResourceManager(this);
        this.resourceLoader = new ResourceLoader(this);

        this.textureScale = 1;
    }
}

export default Loader;
