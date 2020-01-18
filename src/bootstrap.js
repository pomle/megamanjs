const SnakeSilk = require('@snakesilk/engine');
const PlatformKit = require('@snakesilk/platform-kit');
const Traits = require('./traits/parsers');
const Entities = require('./entities');
const Loader = require('./Loader')

console.log(Entities);

function createLoader() {
    const game = new SnakeSilk.Game();
    const loader = new Loader(game);

    loader.entities.add(Entities);

    loader.traits.add(PlatformKit.Traits);
    loader.traits.add(Traits);

    return loader;
}

module.exports = {
    createLoader,
};
