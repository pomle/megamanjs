const {Game} = require('@snakesilk/engine');
const {Traits: PlatformTraits} = require('@snakesilk/platform-kit');
const {
    Entities,
    Loaders: {MegamanLoader},
    Traits: MegamanTraits,
} = require('@snakesilk/megaman-kit');

function createLoader() {
    const game = new Game();
    const loader = new MegamanLoader(game);

    loader.entities.add(Entities);

    loader.traits.add(PlatformTraits);
    loader.traits.add(MegamanTraits);

    return loader;
}

module.exports = {
    createLoader,
};
