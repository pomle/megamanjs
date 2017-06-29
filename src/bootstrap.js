const {Game, Mouse, Hud} = require('@snakesilk/engine');
const {XMLLoader} = require('@snakesilk/xml-loader');
const {Entities} = require('@snakesilk/megaman-kit');

function createLoader() {
    const game = new Game();
    const loader = new XMLLoader(game);

    loader.entities.add(Entities);

    return loader;
}

module.exports = {
    createLoader,
};
