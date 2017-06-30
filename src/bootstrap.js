const {Game, Mouse} = require('@snakesilk/engine');
const {
    Entities,
    Loaders: {MegamanLoader},
} = require('@snakesilk/megaman-kit');

function createLoader() {
    const game = new Game();
    const loader = new MegamanLoader(game);

    loader.entities.add(Entities);

    return loader;
}

module.exports = {
    createLoader,
};
